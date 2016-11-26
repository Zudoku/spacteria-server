const evts = require('./networkingevents.js');
const worldSimulator = require('./worldSimulator.js');
const SAT = require('sat');

let currentRoomID = 1;
const currentPlayers = {};
const rooms = [];
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
          module.exports.makeUserInstance(socket, identifyInfo);
          module.exports.updateObservers();
        }
        if (identifyInfo.type === 'browser') {
          const serializedRooms = rooms.map(obj =>
            module.exports.serilializeRoom(obj)
          );
          const payload = { rooms: serializedRooms, currentPlayers };
          socket.emit(evts.outgoing.OBSERVER_SEND_INFO, payload);
          socket.join('observers');
        }
      });

      socket.on(evts.incoming.MAKE_NEW_ROOM, () => {
        if (module.exports.checkIfIdentified(socket.id)
        && !module.exports.checkIfInRoom(socket.id)) {
          const generatedRoom = module.exports.makeRoom();
          currentPlayers[socket.id].room = generatedRoom.name;
          currentPlayers[socket.id].x = generatedRoom.mapDescription.startX;
          currentPlayers[socket.id].y = generatedRoom.mapDescription.startY;
          currentPlayers[socket.id].shape = new SAT.Box(new SAT.Vector(currentPlayers[socket.id].x,
            currentPlayers[socket.id].y), 32, 32);
          generatedRoom.players.push(currentPlayers[socket.id]);
          // Add the map to worldsimulator if it isnt there yet

          socket.join(generatedRoom.name, (err) => {
            if (err) {
              // console.log(err);
            }
            worldSimulator.init(generatedRoom.mapDescription.filename, generatedRoom);
            // console.log(generatedRoom.enemies);
            socket.emit(evts.outgoing.JOIN_ROOM, module.exports.serilializeRoom(generatedRoom));
            module.exports.updateObservers();
          });
        } else {
          return;
        }
      });

      socket.on(evts.incoming.ROOMLIST_REQUEST, () => {
        socket.emit(evts.outgoing.SEND_ROOMLIST, rooms);
      });
      socket.on(evts.incoming.ASK_TO_JOIN_GAME, (args) => {
        if (module.exports.checkIfIdentified(socket.id)
         && !module.exports.checkIfInRoom(socket.id)) {
          const foundRoom = rooms.find(x => x.name === args.name);
          if (foundRoom !== undefined && foundRoom.players.length < 4) {
            currentPlayers[socket.id].room = foundRoom.name;
            currentPlayers[socket.id].x = foundRoom.mapDescription.startX;
            currentPlayers[socket.id].y = foundRoom.mapDescription.startY;
            currentPlayers[socket.id].shape = new SAT.Box(new SAT.Vector(currentPlayers[socket.id].x,
              currentPlayers[socket.id].y), 32, 32);
            foundRoom.players.push(currentPlayers[socket.id]);
            socket.join(foundRoom.name, (err) => {
              if (err) {
                console.log(err);
              }
              socket.broadcast.emit(evts.outgoing.PLAYER_JOINED_YOUR_GAME,
                 currentPlayers[socket.id]);
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
          currentPlayers[socket.id].x = payload.x;
          currentPlayers[socket.id].y = payload.y;
          currentPlayers[socket.id].shape.pos.x = payload.x;
          currentPlayers[socket.id].shape.pos.y = payload.y;
          socket.broadcast.to(currentPlayers[socket.id].room)
          .emit(evts.outgoing.CORRECT_PLAYER_POSITION,
             { id: socket.id, x: payload.x, y: payload.y });
        } else {
          return;
        }
      });

      socket.on(evts.incoming.SPAWN_PROJECTILE, (payload) => {
        if (module.exports.checkIfIdentified(socket.id)
         && module.exports.checkIfInRoom(socket.id)) {
          const foundRoom = rooms.find(x => x.name === currentPlayers[socket.id].room);

          // Make the projectile
          const playerWhoSpawnProjectile = currentPlayers[socket.id];
          const projectile = { x: playerWhoSpawnProjectile.x, y: playerWhoSpawnProjectile.y, deltaX: 0, deltaY: 0 };

          projectile.image = payload.projectile.image;
          projectile.team = 1;
          projectile.path = 'STRAIGHT';
          projectile.speed = payload.projectile.speed;
          projectile.guid = payload.projectile.guid;
          projectile.collideToTerrain = true;
          projectile.angle = payload.projectile.angle % 360;
          projectile.maxTravelDistance = payload.projectile.maxTravelDistance;
          projectile.travelDistance = 0;
          projectile.damage = 50;
          projectile.shape = new SAT.Box(new SAT.Vector(projectile.x, projectile.y), 2, 2);

          module.exports.addProjectileToGame(projectile, currentPlayers[socket.id].room);
        } else {
          return;
        }
      });

      socket.on('disconnect', () => {
        const disconnectedId = socket.id;
        const disconnectedPlayer = currentPlayers[disconnectedId];
        if (module.exports.checkIfIdentified(disconnectedId) && module.exports.checkIfInRoom(disconnectedId)) {
          const roomThatPlayerDisconnected = rooms.find(x => x.players.indexOf(disconnectedPlayer) !== -1);
          roomThatPlayerDisconnected.players.splice(roomThatPlayerDisconnected.players.indexOf(disconnectedPlayer), 1);
          if (roomThatPlayerDisconnected.players.length === 0) {
            rooms.splice(rooms.indexOf(roomThatPlayerDisconnected), 1);
          } else {
            ioref.to(roomThatPlayerDisconnected.name).emit(evts.outgoing.PLAYER_LEFT_YOUR_GAME, { id: disconnectedId });
          }
        }
        delete currentPlayers[disconnectedId];
        module.exports.updateObservers();
      });
    });
  },
  makeUserInstance(socket, identifyInfo) {
    const userInstance = {
      id: socket.id,
      room: '',
      charactername: identifyInfo.player.charactername,
      characterClass: identifyInfo.player.characterClass,
      x: 128,
      y: 128,
    };
    currentPlayers[socket.id] = userInstance;
    socket.emit(evts.outgoing.SEND_ROOMLIST, rooms);
  },
  makeRoom() {
    const room = {
      name: `room${currentRoomID}`,
      players: [],
      difficulty: 1,
      mapDescription: {
        filename: 'temp.tmx',
        startX: 128,
        startY: 128,
      },
      gameobjects: [], // Static objects that can't be
      enemies: [], // Enemies that can be harmed
      projectiles: [], // Projectiles
    };
    currentRoomID += 1;
    rooms.push(room);
    return room;
  },
  checkIfIdentified(socketId) {
    return (currentPlayers[socketId] !== undefined);
  },
  checkIfInRoom(socketId) {
    return (module.exports.checkIfIdentified(socketId) && currentPlayers[socketId].room.length !== 0);
  },
  serilializeRoom(roomData) {
    return roomData;
  },
  updateObservers() {
    const serializedRooms = rooms.map(obj => module.exports.serilializeRoom(obj));
    const payload = { rooms: serializedRooms, currentPlayers };
    ioref.to('observers').emit(evts.outgoing.OBSERVER_SEND_INFO, payload);
  },
  removeProjectile(hash, room) {
    ioref.to(room.name).emit(evts.outgoing.DESPAWN_PROJECTILE, { id: hash });
  },
  updateNPCPosition(hash, position, room) {
    ioref.to(room.name).emit(evts.outgoing.UPDATE_NPC_POSITION, { id: hash, x: position.x, y: position.y });
  },
  callSimulation() {
    worldSimulator.simulate(rooms, ioref);
  },
  updateroomdescription(room) {
    ioref.to(room.name).emit(evts.outgoing.REFRESH_ROOM_DESCRIPTION, { desc: room, forceUpdate: true });
  },
  addProjectileToGame(projectile, roomname) {
    foundRoom.projectiles.push(projectile);
    ioref.to(roomname).emit(evts.outgoing.SPAWN_PROJECTILE, { projectile: payload.projectile });
  },

};
