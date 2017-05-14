const evts = require('./networkingevents.js');
const worldSimulator = require('./worldSimulator.js');
const worldContainer = require('./worldContainer.js');
const userlogin = require('./db/userlogin.js');
const characters = require('./db/characters.js');
const items = require('./db/items.js');
const SF = require('./staticFuncs.js');

let ioref;

const SIMULATION_INTERVAL = 1000 / 60;

const connectedUsers = {};

function isString(oobj) {
  return (oobj !== undefined && typeof oobj === 'string');
}

module.exports = {
  init(io) {
    ioref = io;
    worldSimulator.initialize(this);

    // Simulate worlds
    console.log('Starting room simulation.');
    setInterval(module.exports.callSimulation, SIMULATION_INTERVAL);

    io.on('connection', (socket) => {
      socket.on(evts.incoming.IDENTIFY, (identifyInfo) => {
        if (identifyInfo.type === undefined) {
          return;
        }
        if (identifyInfo.type === 'game-client') {
          if (!isString(identifyInfo.username) || !isString(identifyInfo.password)) {
            return;
          }
          userlogin.login(identifyInfo.username, identifyInfo.password).then((result) => {
            if (result.success) {
              connectedUsers[socket.id] = result.uniqueid;
              socket.emit(evts.outgoing.LOGIN_SUCCESS, {});
            } else {
              socket.emit(evts.outgoing.LOGIN_FAIL, { reason: result.msg });
            }
          });
          /**
          worldContainer.addPlayer(socket.id, identifyInfo.player);
          socket.emit(evts.outgoing.SEND_ROOMLIST, worldContainer.getRooms());
          module.exports.updateObservers(); **/
        }
        if (identifyInfo.type === 'browser') {
          const serializedRooms = worldContainer.getRooms();
          const payload = { connections: connectedUsers, rooms: serializedRooms, characters: worldContainer.getPlayers() };
          socket.emit(evts.outgoing.OBSERVER_SEND_INFO, payload);
          socket.join('observers');
        }
      });

      socket.on(evts.incoming.LOAD_CHARACTER, (payload) => {
        if (module.exports.checkIfIdentified(socket.id)
        && !module.exports.checkIfPlayerSelected(socket.id)) {
          const characterID = payload.charID;
          characters.getCharacter(characterID).then((characterinfo) => {
            if (characterinfo.success) {
              const character = characterinfo.character;
              if (module.exports.checkPlayerOwnsCharacter(socket.id, character)) {
                Promise.all([
                  items.getItemsForCharacter(characterID),
                  items.getInventoryForCharacter(characterID),
                ]).then((itemdata) => {
                  let [equipmentData, inventoryData] = itemdata;
                  if (equipmentData.success && inventoryData.success) {
                    character.equipment = { data: equipmentData.equipment };
                    character.inventory = { data: inventoryData.inventory };
                    worldContainer.addPlayer(socket.id, character);
                    socket.emit(evts.outgoing.CHARACTER_LOAD_SUCCESSFUL, { character });
                  } else {
                    return;
                  }
                });
              } else {
                return;
              }
            } else {
              return;
            }
          });
        } else {
          return;
        }
      });

      socket.on(evts.incoming.MAKE_NEW_ROOM, () => {
        if (module.exports.checkIfPlayerSelected(socket.id)
        && !module.exports.checkIfInRoom(socket.id)) {
          const currentPlayer = worldContainer.getPlayers()[socket.id];
          const generatedRoom = worldContainer.makeRoom(currentPlayer);

          socket.join(generatedRoom.name, (err) => {
            if (err) {
              // console.log(err);
            }
            worldSimulator.init(generatedRoom.mapDescription.filename, generatedRoom);
            // console.log(generatedRoom.enemies);
            socket.emit(evts.outgoing.JOIN_ROOM, generatedRoom);
            module.exports.updateObservers();
          });
        } else {
          return;
        }
      });

      socket.on(evts.incoming.CHARACTERLIST_REQUEST, () => {
        if (module.exports.checkIfIdentified(socket.id)) {
          characters.listCharacters(connectedUsers[socket.id]).then((charsObj) => {
            if (charsObj.success) {
              socket.emit(evts.outgoing.SEND_CHARACTERLIST, { chars: charsObj.characters });
            } else {
              console.log(charsObj.msg);
            }
          });
        } else {
          return;
        }
      });

      socket.on(evts.incoming.ROOMLIST_REQUEST, () => {
        socket.emit(evts.outgoing.SEND_ROOMLIST, worldContainer.getRooms());
      });
      socket.on(evts.incoming.ASK_TO_JOIN_GAME, (args) => {
        if (module.exports.checkIfPlayerSelected(socket.id)
         && !module.exports.checkIfInRoom(socket.id)) {
          const currentPlayer = worldContainer.getPlayers()[socket.id];
          const foundRoom = worldContainer.getRooms().find(x => x.name === args.name);
          if (foundRoom !== undefined && foundRoom.players.length < 4) {
            worldContainer.addPlayerToRoom(currentPlayer, foundRoom);
            socket.join(foundRoom.name, (err) => {
              if (err) {
                console.log(err);
              }
              socket.broadcast.emit(evts.outgoing.PLAYER_JOINED_YOUR_GAME,
                 currentPlayer);
              socket.emit(evts.outgoing.JOIN_ROOM, foundRoom);
              module.exports.updateObservers();
            });
          }
        } else {
          return;
        }
      });

      socket.on(evts.incoming.UPDATE_POSITION, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          const currentPlayer = worldContainer.getPlayers()[socket.id];
          worldContainer.updatePlayerPosition(currentPlayer, payload.x, payload.y);
          socket.broadcast.to(currentPlayer.room)
          .emit(evts.outgoing.CORRECT_PLAYER_POSITION,
             { id: socket.id, x: payload.x, y: payload.y });
        } else {
          return;
        }
      });

      socket.on(evts.incoming.SPAWN_PROJECTILE, (payload) => {
        if (module.exports.checkIfPlayerSelected(socket.id)
         && module.exports.checkIfInRoom(socket.id)) {
          const currentPlayer = worldContainer.getPlayers()[socket.id];
          const projectile = worldContainer.playerAttack(currentPlayer, payload);

          module.exports.addProjectileToGame(projectile, currentPlayer.room);
        } else {
          return;
        }
      });

      socket.on(evts.incoming.LOOT_ITEM, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          const currentPlayer = worldContainer.getPlayers()[socket.id];
          const result = worldContainer.playerLoot(currentPlayer, payload.lootbagHash, payload.index);
          if (result !== undefined) {
            if (result.length > 0) {
              module.exports.broadcastLootBagChangeToGame(result, payload.lootbagHash, currentPlayer.room);
            } else {
              worldContainer.removeGameobject(currentPlayer.room, payload.lootbagHash);
              module.exports.removeGameobject(payload.lootbagHash, { name: currentPlayer.room });
            }
            // broadcast character status
            // console.log(require('util').inspect(currentPlayer, { depth: null }));
            socket.emit(evts.outgoing.UPDATE_CHARATER_STATUS, { character: currentPlayer.characterdata });
          }
        } else {
          return;
        }
      });

      socket.on(evts.incoming.EQUIP_ITEM, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          const currentPlayer = worldContainer.getPlayers()[socket.id];
          if (worldContainer.equipItem(currentPlayer, payload.index)) {
            socket.emit(evts.outgoing.UPDATE_CHARATER_STATUS, { character: currentPlayer.characterdata });
          }
        }
      });

      socket.on(evts.incoming.UNEQUIP_ITEM, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          const currentPlayer = worldContainer.getPlayers()[socket.id];
          if (worldContainer.unEquipItem(currentPlayer, payload.slot)) {
            socket.emit(evts.outgoing.UPDATE_CHARATER_STATUS, { character: currentPlayer.characterdata });
          }
        }
      });

      socket.on(evts.incoming.DROP_ITEM, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          const currentPlayer = worldContainer.getPlayers()[socket.id];
          const itemWrapperReference = currentPlayer.characterdata.inventory.data[payload.slot];
          if (worldContainer.removeItemFromInventory(currentPlayer, payload.slot, Number.MAX_SAFE_INTEGER)) {
            socket.emit(evts.outgoing.UPDATE_CHARATER_STATUS, { character: currentPlayer.characterdata });
            // add lootbag
            const lootBag = {
              type: 1,
              lootbag: {
                quality: 1,
                items: [itemWrapperReference],
                x: currentPlayer.x,
                y: currentPlayer.y,
              },
              x: currentPlayer.x,
              y: currentPlayer.y,
              hash: SF.guid(),
            };
            worldContainer.getRooms().find(x => x.name === currentPlayer.room).gameobjects.push(lootBag);
            module.exports.broadcastLootBagToGame(lootBag.lootbag, lootBag.hash, { name: currentPlayer.room });
          }
        }
      });

      socket.on('disconnect', () => {
        const disconnectedId = socket.id;
        const disconnectedPlayer = worldContainer.getPlayers()[disconnectedId];
        if (module.exports.checkIfIdentified(disconnectedId)) {
          if (module.exports.checkIfPlayerSelected(disconnectedId)) {
            if (module.exports.checkIfInRoom(disconnectedId)) {
              const disconnectionRoom = worldContainer.getRooms().find(x => x.players.indexOf(disconnectedPlayer) !== -1);
              worldContainer.removePlayerFromRoom(disconnectedPlayer, disconnectionRoom);
              if (disconnectionRoom.players.length === 0) {
                worldContainer.removeRoom(disconnectionRoom);
              } else {
                ioref.to(disconnectionRoom.name).emit(evts.outgoing.PLAYER_LEFT_YOUR_GAME, { id: disconnectedId });
              }
            }
            worldContainer.removePlayer(disconnectedPlayer);
          }
          module.exports.removeIdentification(disconnectedId);
        }
        module.exports.updateObservers();
      });
    });
  },
  checkIfIdentified(socketId) {
    return (connectedUsers[socketId] !== undefined);
  },
  checkIfPlayerSelected(socketId) {
    return module.exports.checkIfIdentified(socketId) && (worldContainer.getPlayers()[socketId] !== undefined);
  },
  checkIfInRoom(socketId) {
    return (module.exports.checkIfPlayerSelected(socketId) && worldContainer.getPlayers()[socketId].room.length !== 0);
  },
  checkPlayerOwnsCharacter(socketId, character) {
    return (connectedUsers[socketId] === character.userid);
  },
  updateObservers() {
    const serializedRooms = worldContainer.getRooms();
    const payload = { rooms: serializedRooms, players: worldContainer.getPlayers() };
    ioref.to('observers').emit(evts.outgoing.OBSERVER_SEND_INFO, payload);
  },
  removeGameobject(hash, room) {
    ioref.to(room.name).emit(evts.outgoing.DESPAWN_GAMEOBJECT, { id: hash });
  },
  updateNPCPosition(hash, position, room) {
    ioref.to(room.name).emit(evts.outgoing.UPDATE_NPC_POSITION, { id: hash, x: position.x, y: position.y });
  },
  callSimulation() {
    worldSimulator.simulate(worldContainer.getRooms(), ioref);
  },
  updateroomdescription(room) {
    ioref.to(room.name).emit(evts.outgoing.REFRESH_ROOM_DESCRIPTION, { desc: room, forceUpdate: true });
  },
  addProjectileToGame(projectileObject, roomname) {
    const foundRoom = worldContainer.getRooms().find(x => x.name === roomname);
    foundRoom.projectiles.push(projectileObject);
    ioref.to(roomname).emit(evts.outgoing.SPAWN_PROJECTILE, { projectile: projectileObject });
  },
  broadcastLootBagToGame(lootbagObject, hash, room) {
    const payload = { lootbag: lootbagObject, guid: hash };
    ioref.to(room.name).emit(evts.outgoing.SPAWN_LOOTBAG, payload);
  },
  broadcastLootBagChangeToGame(lootbagitems, hash, room) {
    const payload = { lootbag: lootbagitems, guid: hash };

    ioref.to(room).emit(evts.outgoing.UPDATE_LOOTBAG_STATUS, payload);
  },
  removeIdentification(socketId) {
    delete connectedUsers[socketId];
  },

};
