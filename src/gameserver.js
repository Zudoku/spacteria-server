const SF = require('./staticFuncs.js');
const worldUtil = require('./worldUtil.js');
const evts = require('./networkingevents.js');
const worldSimulator = require('./worldSimulator.js');
const worldContainer = require('./worldContainer.js');
const userlogin = require('./db/userlogin.js');
const chatManager = require('./chat/chatManager.js');

const loadingEventHandler = require('./loadingEventHandler.js');
const gameplayEventHandler = require('./gameplayEventHandler.js');

const gameplayconfig = require('./../config/gameplayconfig.js');

const connections = {};
let ioref;


let tickAmount = 0;

module.exports = {
  init(io) {
    ioref = io;
    worldSimulator.initialize(this);
    // Simulate worlds
    module.exports.doTimer();

    io.on('connection', (socket) => {
      socket.on(evts.incoming.IDENTIFY, (identifyInfo) => {
        module.exports.handleIdentify(identifyInfo, socket);
      });

      setTimeout(() => {
        socket.emit(evts.outgoing.VERSION_DATA, { version: gameplayconfig.VERSION_STRING, changelog: gameplayconfig.VERSION_CHANGELOG });
      }, 100);

      socket.on(evts.incoming.LOAD_CHARACTER, (payload) => {
        if (module.exports.checkIfIdentified(socket.id)
        && !module.exports.checkIfPlayerSelected(socket.id)) {
          loadingEventHandler.loadCharacter(worldContainer, connections, socket, payload);
        }
      });

      socket.on(evts.incoming.MAKE_NEW_ROOM, () => {
        if (module.exports.checkIfPlayerSelected(socket.id)
        && !module.exports.checkIfInRoom(socket.id)) {
          loadingEventHandler.makeNewRoom(worldSimulator, worldContainer, socket);
          module.exports.updateObservers();
        }
      });

      socket.on(evts.incoming.CHARACTERLIST_REQUEST, () => {
        if (module.exports.checkIfIdentified(socket.id)) {
          loadingEventHandler.characterlist(connections, socket);
        }
      });

      socket.on(evts.incoming.ROOMLIST_REQUEST, () => {
        socket.emit(evts.outgoing.SEND_ROOMLIST, { roomlist: worldContainer.getRooms() });
      });

      socket.on(evts.incoming.ASK_TO_JOIN_GAME, (payload) => {
        if (module.exports.checkIfPlayerSelected(socket.id)
         && !module.exports.checkIfInRoom(socket.id)) {
          loadingEventHandler.joinRoom(worldContainer, socket, payload);
          module.exports.updateObservers();
        }
      });

      socket.on(evts.incoming.UPDATE_POSITION, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          gameplayEventHandler.updatePosition(worldContainer, socket, payload);
        }
      });

      socket.on(evts.incoming.SPAWN_PROJECTILE, (payload) => {
        if (module.exports.checkIfPlayerSelected(socket.id)
         && module.exports.checkIfInRoom(socket.id)) {
          gameplayEventHandler.playerAttack(this, worldContainer, socket, payload);
        }
      });

      socket.on(evts.incoming.LOOT_ITEM, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          gameplayEventHandler.lootItem(this, worldContainer, socket, payload);
        }
      });

      socket.on(evts.incoming.EQUIP_ITEM, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          gameplayEventHandler.equipItem(this, worldContainer, socket, payload);
        }
      });

      socket.on(evts.incoming.UNEQUIP_ITEM, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          gameplayEventHandler.unEquipItem(this, worldContainer, socket, payload);
        }
      });

      socket.on(evts.incoming.DROP_ITEM, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          gameplayEventHandler.dropItem(this, worldContainer, socket, payload);
        }
      });

      socket.on(evts.incoming.SELL_ITEM, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          gameplayEventHandler.sellItem(this, worldContainer, socket, payload);
        }
      });

      socket.on(evts.incoming.TELEPORT_TO_CAMP, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          loadingEventHandler.changeMap(this, worldContainer, worldSimulator, socket, { to: 1 });
        }
      });

      socket.on(evts.incoming.ENTER_PORTAL, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          loadingEventHandler.changeMap(this, worldContainer, worldSimulator, socket, payload);
        }
      });

      socket.on(evts.incoming.MAP_LOADED, () => {
        if (module.exports.checkIfInRoom(socket.id)) {
          loadingEventHandler.mapLoaded(worldContainer, socket);
        }
      });

      socket.on(evts.incoming.CREATE_CHARACTER, (payload) => {
        if (module.exports.checkIfIdentified(socket.id)) {
          loadingEventHandler.addCharacter(payload.charactername, socket, connections[socket.id]);
        }
      });
      socket.on(evts.incoming.DELETE_CHARACTER, (payload) => {
        if (module.exports.checkIfIdentified(socket.id)) {
          loadingEventHandler.deleteCharacter(payload.characterID, socket, connections);
        }
      });
      socket.on(evts.incoming.UPLOAD_ITEMDATA, (payload) => {
        if (module.exports.checkIfIdentified(socket.id)) {
          loadingEventHandler.uploadItemData(socket, payload);
        }
      });
      socket.on(evts.incoming.RELOAD_DASHBOARD_DATA, (payload) => {
        if (module.exports.checkIfIdentified(socket.id)) {
          module.exports.sendDataInfo(socket);
        }
      });
      socket.on(evts.incoming.EMIT_CHAT_MSG, (payload) => {
        if (module.exports.checkIfInRoom(socket.id)) {
          chatManager.emit(payload.msg, connections[socket.id].username, ioref);
        }
      });

      socket.on('disconnect', () => {
        module.exports.handleDisconnect(socket);
      });
    });
  },
  handleIdentify(identifyInfo, socket) {
    if (identifyInfo.type === undefined) {
      return;
    }
    if (identifyInfo.type === 'game-client') {
      if (!SF.isString(identifyInfo.username) || !SF.isString(identifyInfo.password)) {
        return;
      }
      console.log('t');
      userlogin.login(identifyInfo.username, identifyInfo.password).then((result) => {
        if (result.success) {
          let allowLogin = true;
          if (!gameplayconfig.allow_multiple_logins_on_account) {
            /* eslint no-unused-vars: "off"*/
            Object.entries(connections).forEach(([key, value]) => {
              if (value.type !== 'browser' && value.id === result.uniqueid) {
                socket.emit(evts.outgoing.LOGIN_FAIL, { reason: 'User already logged in!' });
                console.log(`[LOGIN]: User ${identifyInfo.username} already logged on, failing login.`);
                allowLogin = false;
              }
            });
          }
          if (allowLogin) {
            // console.log(`${socket.id} joined the server`);
            connections[socket.id] = {
              id: result.uniqueid,
              username: identifyInfo.username,
              ip: socket.request.connection.remoteAddress,
              type: identifyInfo.type,
            };
            socket.emit(evts.outgoing.LOGIN_SUCCESS, {});
            socket.join('chat', (err) => {});
          }
        } else {
          socket.emit(evts.outgoing.LOGIN_FAIL, { reason: result.msg });
        }
      });
    }
    if (identifyInfo.type === 'browser') {
      connections[socket.id] = {
        id: '-',
        username: identifyInfo.page,
        charactername: '-',
        ip: socket.request.connection.remoteAddress,
        type: identifyInfo.type,
      };
      if (identifyInfo.page === 'livedashboard') {
        socket.join('observers');
        // console.log(`${socket.id} joined the observers`);
      } else if (identifyInfo.page === 'datadashboard') {
        module.exports.sendDataInfo(socket);
      }


      module.exports.updateObservers();
    }
  },
  checkIfIdentified(socketId) {
    return (connections[socketId] !== undefined);
  },
  checkIfPlayerSelected(socketId) {
    return module.exports.checkIfIdentified(socketId) && (worldContainer.getPlayers()[socketId] !== undefined);
  },
  checkIfInRoom(socketId) {
    return (module.exports.checkIfPlayerSelected(socketId) && worldContainer.getPlayers()[socketId].room.length !== 0);
  },
  updateObservers() {
    const serializedRooms = worldContainer.getRooms();
    const payload = { connections, rooms: serializedRooms, players: worldContainer.getPlayers() };
    ioref.to('observers').emit(evts.outgoing.OBSERVER_SEND_INFO, payload);
  },
  handleDisconnect(socket) {
    const disconnectedId = socket.id;
    console.log(`[LOGIN]: ${socket.id} left the server`);
    const disconnectedPlayer = worldContainer.getPlayers()[disconnectedId];
    if (module.exports.checkIfIdentified(disconnectedId)) {
      if (module.exports.checkIfPlayerSelected(disconnectedId)) {
        if (module.exports.checkIfInRoom(disconnectedId)) {
          const disconnectionRoom = worldContainer.getRooms().find(x => x.players.indexOf(disconnectedPlayer) !== -1);
          worldContainer.removePlayerFromRoom(disconnectedPlayer, disconnectionRoom);
          // worldUtil.tryToSaveItemData(disconnectedPlayer, true, true, true);
          if (disconnectionRoom.players.length === 0) {
            worldContainer.removeRoom(disconnectionRoom);
          } else {
            worldSimulator.checkAllDeadInRoom(disconnectionRoom);
            ioref.to(disconnectionRoom.name).emit(evts.outgoing.PLAYER_LEFT_YOUR_GAME, { id: disconnectedId });
          }
        }
        worldContainer.removePlayer(disconnectedPlayer);
      }
      module.exports.removeIdentification(disconnectedId);
      module.exports.updateObservers();
    }
  },
  removeIdentification(socketId) {
    delete connections[socketId];
  },
  doTimer() {
    const speed = gameplayconfig.SIMULATION_INTERVAL;
    let count = 1;
    const start = new Date().getTime();

    function instance() {
      count++;
      tickAmount++;
      worldSimulator.simulate(worldContainer.getRooms(), ioref, count);
      if (tickAmount % 100 === 0) {
        module.exports.updateObservers();
      }

      const diff = (new Date().getTime() - start) - (count * speed);
      setTimeout(instance, (speed - diff));
    }
    setTimeout(instance, speed);
  },
  refreshStatsForPlayer(player) {
    /* eslint no-param-reassign: "off"*/
    player.stats = worldUtil.calculateStatsForCharacter(player.characterdata, player.stats.health);
  },
  sendDataInfo(socket) {
    loadingEventHandler.getDataForDashBoard(socket);
  },
  //            |||
  // BROADCASTS |||
  //            vvv
  broadcastRemoveGameobject(hash, room) {
    ioref.to(room.name).emit(evts.outgoing.DESPAWN_GAMEOBJECT, { id: hash });
  },
  broadcastUpdateNPCPosition(hash, position, room) {
    ioref.to(room.name).emit(evts.outgoing.UPDATE_NPC_POSITION, { id: hash, x: position.x, y: position.y });
  },
  broadcastUpdateRoomDescription(room) {
    ioref.to(room.name).emit(evts.outgoing.REFRESH_ROOM_DESCRIPTION, { desc: room, forceUpdate: true });
  },
  broadcastLootBagToGame(lootbag, hash, room) {
    const payload = { lootbag, guid: hash };
    ioref.to(room.name).emit(evts.outgoing.SPAWN_LOOTBAG, payload);
  },
  broadcastEnemyToGame(enemy, hash, room) {
    const payload = { enemy, hash };
    ioref.to(room.name).emit(evts.outgoing.SPAWN_ENEMY, payload);
  },
  broadcastLootBagChangeToGame(lootbag, hash, room) {
    const payload = { lootbag, guid: hash };
    ioref.to(room).emit(evts.outgoing.UPDATE_LOOTBAG_STATUS, payload);
  },
  broadcastCharacterStatus(socketId) {
    const currentPlayer = worldContainer.getPlayers()[socketId];
    ioref.to(socketId).emit(evts.outgoing.UPDATE_CHARATER_STATUS, { character: currentPlayer.characterdata, stats: currentPlayer.stats });
  },
  broadcastProjectileSpawn(projectile, room) {
    ioref.to(room.name).emit(evts.outgoing.SPAWN_PROJECTILE, { projectile });
  },
  broadcastChatMessage(msg, style) {
    chatManager.send(msg, ioref, style);
  },
  broadcastChatMessageRoom(msg, style, room) {
    chatManager.sendRoom(msg, ioref, style, room);
  },
  broadcastLoadNewMap(room, mapdata, name, type, width, height) {
    const payloadEvent = {
      mapdata,
      name,
      type,
      width,
      height,
    };
    ioref.to(room.name).emit(evts.outgoing.LOAD_NEW_MAP, payloadEvent);
  },
  broadcastAllDead(room) {
    ioref.to(room.name).emit(evts.outgoing.CHARACTERS_ALL_DEAD, {});
  },
};
