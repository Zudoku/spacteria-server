const evts = require('./networkingevents.js');
const worldSimulator = require('./worldSimulator.js');
const worldContainer = require('./worldContainer.js');

let ioref;


module.exports = {
  init(io) {
    ioref = io;
    worldSimulator.initialize(this);

    setInterval(module.exports.callSimulation, 1000 / 60);

    io.on('connection', (socket) => {
      socket.on(evts.incoming.IDENTIFY, (identifyInfo) => {
        if (identifyInfo.type === undefined) {
          return;
        }
        if (identifyInfo.type === 'game-client') {
          worldContainer.addPlayer(socket.id, identifyInfo.player);
          socket.emit(evts.outgoing.SEND_ROOMLIST, worldContainer.getRooms());
          module.exports.updateObservers();
        }
        if (identifyInfo.type === 'browser') {
          const serializedRooms = worldContainer.getRooms().map(obj =>
            module.exports.serilializeRoom(obj)
          );
          const payload = { rooms: serializedRooms, players: worldContainer.getCurrentPlayers() };
          socket.emit(evts.outgoing.OBSERVER_SEND_INFO, payload);
          socket.join('observers');
        }
      });

      socket.on(evts.incoming.MAKE_NEW_ROOM, () => {
        if (module.exports.checkIfIdentified(socket.id)
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

      socket.on(evts.incoming.ROOMLIST_REQUEST, () => {
        socket.emit(evts.outgoing.SEND_ROOMLIST, worldContainer.getRooms());
      });
      socket.on(evts.incoming.ASK_TO_JOIN_GAME, (args) => {
        if (module.exports.checkIfIdentified(socket.id)
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
        if (module.exports.checkIfIdentified(socket.id)
         && module.exports.checkIfInRoom(socket.id)) {
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
        if (module.exports.checkIfIdentified(socket.id)
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
        if (module.exports.checkIfIdentified(disconnectedId) && module.exports.checkIfInRoom(disconnectedId)) {
          const disconnectionRoom = worldContainer.getRooms().find(x => x.players.indexOf(disconnectedPlayer) !== -1);
          worldContainer.removePlayerFromRoom(disconnectedPlayer, disconnectionRoom);
          if (disconnectionRoom.players.length === 0) {
            worldContainer.removeRoom(disconnectionRoom);
          } else {
            ioref.to(disconnectionRoom.name).emit(evts.outgoing.PLAYER_LEFT_YOUR_GAME, { id: disconnectedId });
          }
        }
        module.exports.updateObservers();
      });
    });
  },
  checkIfIdentified(socketId) {
    return (worldContainer.getPlayers()[socketId] !== undefined);
  },
  checkIfInRoom(socketId) {
    return (module.exports.checkIfIdentified(socketId) && worldContainer.getPlayers()[socketId].room.length !== 0);
  },
  updateObservers() {
    const serializedRooms = worldContainer.getRooms();
    const payload = { rooms: serializedRooms, players: worldContainer.getPlayers() };
    ioref.to('observers').emit(evts.outgoing.OBSERVER_SEND_INFO, payload);
  },
  removeProjectile(hash, room) {
    ioref.to(room.name).emit(evts.outgoing.DESPAWN_PROJECTILE, { id: hash });
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

};
