const SF = require('./staticFuncs.js');

const characters = require('./db/characters.js');
const items = require('./db/items.js');

const maputil = require('./mapgeneration/maputil.js');
const gamemapDescriptions = require('./gamemapDescriptions.js');

const evts = require('./networkingevents.js');

module.exports = {
  loadCharacter(worldContainer, connections, socket, payload) {
    /* eslint no-param-reassign: "off"*/
    const characterID = payload.charID;
    characters.getCharacter(characterID).then((characterinfo) => {
      if (characterinfo.success) {
        const character = characterinfo.character;
        if (module.exports.checkPlayerOwnsCharacter(connections, socket.id, character)) {
          Promise.all([
            items.getEquipmentForCharacter(characterID),
            items.getInventoryForCharacter(characterID),
          ]).then((itemdata) => {
            const [equipmentData, inventoryData] = itemdata;
            if (equipmentData.success && inventoryData.success) {
              character.equipment = { data: equipmentData.equipment || { } };
              character.inventory = { data: inventoryData.inventory || { } };
              const playerRef = worldContainer.addPlayer(socket.id, character);
              connections[socket.id].charactername = character.name;
              socket.emit(evts.outgoing.CHARACTER_LOAD_SUCCESSFUL, { character, stats: playerRef.stats });
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
  },
  makeNewRoom(worldSimulator, worldContainer, socket) {
    const currentPlayer = worldContainer.getPlayers()[socket.id];
    const generatedRoom = worldContainer.makeRoom(currentPlayer);

    socket.join(generatedRoom.name, (err) => {
      if (err) {
        // TODO: Handle error
      }
      worldSimulator.init(generatedRoom.mapDescription.filename, generatedRoom, true, false);
      socket.emit(evts.outgoing.JOIN_ROOM, generatedRoom);
    });
  },
  characterlist(connections, socket) {
    characters.listCharacters(connections[socket.id].id).then((charsObj) => {
      if (charsObj.success) {
        socket.emit(evts.outgoing.SEND_CHARACTERLIST, { chars: charsObj.characters });
      } else {
        // TODO: Handle error
      }
    });
  },
  joinRoom(worldContainer, socket, payload) {
    const currentPlayer = worldContainer.getPlayers()[socket.id];
    const foundRoom = worldContainer.getRooms().find(x => x.name === payload.name);
    if (foundRoom !== undefined && foundRoom.players.length < 4) {
      worldContainer.addPlayerToRoom(currentPlayer, foundRoom);
      socket.join(foundRoom.name, (err) => {
        if (err) {
          // TODO: Handle error
        }
        socket.broadcast.emit(evts.outgoing.PLAYER_JOINED_YOUR_GAME,
           currentPlayer);
        socket.emit(evts.outgoing.JOIN_ROOM, foundRoom);
      });
    }
  },
  changeMap(gameserver, worldContainer, worldSimulator, socket, payload) {
    const currentPlayer = worldContainer.getPlayers()[socket.id];
    const currentRoom = worldContainer.getRooms().find(x => x.name === currentPlayer.room);
    const nextMapDescription = gamemapDescriptions.getDescs()[`${payload.to}`];
    if (!maputil.isDynamicMap(payload.to)) {
      worldSimulator.init(nextMapDescription.filename, currentRoom, true, true);
      return;
    }
    const nextMap = maputil.getTilemap(nextMapDescription.generationData);
    const mapname = SF.guid();
    maputil.saveTilemap(nextMap.map, mapname, nextMapDescription.width, nextMapDescription.height, payload.to, () => {
      worldSimulator.init(mapname, currentRoom, true, true, nextMap.rooms);
      gameserver.broadcastLoadNewMap(currentRoom, maputil.getPreparedTileData(nextMap.map,
        nextMapDescription.width, nextMapDescription.height), mapname, payload.to,
        nextMapDescription.width, nextMapDescription.height
      );
    });
  },
  mapLoaded(worldContainer, socket) {
    const currentPlayer = worldContainer.getPlayers()[socket.id];
    const currentRoom = worldContainer.getRooms().find(x => x.name === currentPlayer.room);
    socket.emit(evts.outgoing.REFRESH_ROOM_DESCRIPTION, { desc: currentRoom, forceUpdate: true });
  },
  checkPlayerOwnsCharacter(connections, socketId, character) {
    return (connections[socketId].id === character.userid);
  },
};
