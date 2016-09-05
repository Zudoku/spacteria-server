var evts = require('./networkingevents.js');

var currentRoomID = 1;
var currentPlayers = {};
var rooms = [];
var ioref;

module.exports = {
  init : function(io){
    ioref = io;
    io.on('connection', function(socket){
      socket.on(evts.incoming.IDENTIFY,function(identifyInfo){
        if(identifyInfo.type == undefined){
          return;
        }
        if(identifyInfo.type == 'game-client'){
          module.exports.makeUserInstance(socket,identifyInfo);
          module.exports.updateObservers();
        }
        if(identifyInfo.type == 'browser'){
          var serializedRooms = rooms.map(function(obj){ return module.exports.serilializeRoom(obj);});
          var payload = {rooms : serializedRooms, currentPlayers : currentPlayers};
          socket.emit(evts.outgoing.OBSERVER_SEND_INFO,payload);
          socket.join('observers');
        }
      });

      socket.on(evts.incoming.MAKE_NEW_ROOM,function(identifyInfo){
        if(module.exports.checkIfIdentified(socket.id) && !module.exports.checkIfInRoom(socket.id)){
          var generatedRoom = module.exports.makeRoom();
          currentPlayers[socket.id].room = generatedRoom.name;
          currentPlayers[socket.id].x = generatedRoom.mapDescription.startX;
          currentPlayers[socket.id].y = generatedRoom.mapDescription.startY;
          generatedRoom.players.push(currentPlayers[socket.id]);
          socket.join(generatedRoom.name,function(err){
            socket.emit(evts.outgoing.JOIN_ROOM,module.exports.serilializeRoom(generatedRoom));
            module.exports.updateObservers();
          });
        } else {
          return;
        }
      });

      socket.on(evts.incoming.ROOMLIST_REQUEST,function(args){
        socket.emit(evts.outgoing.SEND_ROOMLIST,rooms);
      });
      socket.on(evts.incoming.ASK_TO_JOIN_GAME,function(args){
        if(module.exports.checkIfIdentified(socket.id) && !module.exports.checkIfInRoom(socket.id)){
          var foundRoom = rooms.find(x => x.name == args.name);
          if(foundRoom != undefined && foundRoom.players.length < 4){
            currentPlayers[socket.id].room = foundRoom.name;
            currentPlayers[socket.id].x = foundRoom.mapDescription.startX;
            currentPlayers[socket.id].y = foundRoom.mapDescription.startY;
            foundRoom.players.push(currentPlayers[socket.id]);
            socket.join(foundRoom.name,function(err){
              socket.broadcast.emit(evts.outgoing.PLAYER_JOINED_YOUR_GAME,currentPlayers[socket.id]);
              socket.emit(evts.outgoing.JOIN_ROOM,foundRoom);
              module.exports.updateObservers();
            });
          }
        } else {
          return;
        }
      });

      socket.on(evts.incoming.UPDATE_POSITION,function(payload){
        if(module.exports.checkIfIdentified(socket.id) && module.exports.checkIfInRoom(socket.id)){
          currentPlayers[socket.id].x = payload.x;
          currentPlayers[socket.id].y = payload.y;
          socket.broadcast.to(currentPlayers[socket.id].room).emit(evts.outgoing.CORRECT_PLAYER_POSITION, { id : socket.id, x : payload.x, y : payload.y });
        } else {
          return;
        }
      });

      socket.on('disconnect', function(){
        var disconnectedId = socket.id;
        var disconnectedPlayer = currentPlayers[disconnectedId];
        if(module.exports.checkIfIdentified(disconnectedId) && module.exports.checkIfInRoom(disconnectedId)){
          var roomThatPlayerDisconnected = rooms.find(x => x.players.indexOf(disconnectedPlayer) != -1);
          roomThatPlayerDisconnected.players.splice(roomThatPlayerDisconnected.players.indexOf(disconnectedPlayer),1);
          if(roomThatPlayerDisconnected.players.length == 0){
            rooms.splice(rooms.indexOf(roomThatPlayerDisconnected),1);
          } else {
            ioref.to(roomThatPlayerDisconnected.name).emit(evts.outgoing.PLAYER_LEFT_YOUR_GAME, { id : disconnectedId });
          }
        }
        delete currentPlayers[disconnectedId];
        module.exports.updateObservers();
      });
    });
  },
  makeUserInstance : function(socket, identifyInfo){
    var userInstance = {
      id : socket.id,
      room : "",
      charactername : identifyInfo.player.charactername,
      characterClass : identifyInfo.player.characterClass,
      x : 128,
      y : 128
    };
    currentPlayers[socket.id] = userInstance;
    socket.emit(evts.outgoing.SEND_ROOMLIST,rooms);
  },
  makeRoom : function(){
    var room = {
      name : "room" + currentRoomID,
      players : [],
      difficulty : 1,
      mapDescription : {
        filename : "temp.tmx",
        startX : 128,
        startY : 128
      }
    };
    currentRoomID++;
    rooms.push(room);
    return room;
  },
  checkIfIdentified : function(socketId){
    return (currentPlayers[socketId] != undefined);
  },
  checkIfInRoom : function(socketId){
    return (module.exports.checkIfIdentified(socketId) && currentPlayers[socketId].room.length != 0);
  },
  serilializeRoom : function(roomData){
    var clonedRoomData = {
      name : roomData.name,
      players : roomData.players.length,
      difficulty : roomData.difficulty,
      mapDescription : roomData.mapDescription
    };
    return roomData;
  },
  updateObservers : function(){
    var serializedRooms = rooms.map(function(obj){ return module.exports.serilializeRoom(obj);});
    var payload = {rooms : serializedRooms, currentPlayers : currentPlayers};
    ioref.to('observers').emit(evts.outgoing.OBSERVER_SEND_INFO,payload);
  }

};
