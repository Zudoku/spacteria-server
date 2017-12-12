const SF = require('./staticFuncs.js');

const characters = require('./db/characters.js');
const items = require('./db/items.js');
const currencies = require('./db/currencies.js');

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
            currencies.getCurrencies(characterID),
          ]).then((itemdata) => {
            const [equipmentData, inventoryData, currencyData] = itemdata;
            if (equipmentData.success && inventoryData.success) {
              character.equipment = { data: equipmentData.equipment || { } };
              character.inventory = { data: inventoryData.inventory || { } };
              character.currencies = currencyData.currencies || { };
              character.status = 'ALIVE';
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
  addCharacter(characternameUnsanitized, socket, connectionObj) {
    console.log(`[CHARACTER]: ${characternameUnsanitized} created.`, socket.id);
    if (characternameUnsanitized !== undefined && /^[a-zA-Z0-9_-]*$/.test(characternameUnsanitized)) {
      characters.addCharacter(characternameUnsanitized, connectionObj.id).then((result) => {
        if (result.success) {
          socket.emit(evts.outgoing.CHARACTER_CREATED, {});
        } else {
          socket.emit(evts.outgoing.BAD_CHARACTERNAME, { info: 'Character with that name already exists.' });
        }
      });
    } else {
      socket.emit(evts.outgoing.BAD_CHARACTERNAME, { info: 'Character name can only contain letters, numbers and symbols _ -' });
    }
  },
  deleteCharacter(characterID, socket, connections) {
    characters.getCharacter(characterID).then((characterinfo) => {
      if (characterinfo.success) {
        if (module.exports.checkPlayerOwnsCharacter(connections, socket.id, { userid: characterinfo.character.userid })) {
          characters.deleteCharacter(characterID).then(() => {
            module.exports.characterlist(connections, socket);
          });
        }
      }
    });
  },
  uploadItemData(socket, payload) {
    items.saveItemsToDatabase(payload.items).then((msg) => {
      socket.emit(evts.outgoing.ALERT_DASHBOARD, { msg });
    });
  },
  getDataForDashBoard(socket) {
    Promise.all([
      items.getAllItems(),
      1,
    ]).then((data) => {
      socket.emit(evts.outgoing.DATADASHBOARD_SET_DATA, { items: data[0] });
    });
  },
};
