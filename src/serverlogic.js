const evts = require('./networkingevents.js');
const worldSimulator = require('./worldSimulator.js');
const worldContainer = require('./worldContainer.js');
const userlogin = require('./db/userlogin.js');
const characters = require('./db/characters.js');

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
                worldContainer.addPlayer(socket.id, character);
                socket.emit(evts.outgoing.CHARACTER_LOAD_SUCCESSFUL, {});
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
    console.log(payload);
    console.log(payload.lootbag);
    ioref.to(room.name).emit(evts.outgoing.SPAWN_LOOTBAG, payload);
  },
  removeIdentification(socketId) {
    delete connectedUsers[socketId];
  },

};
