const SAT = require('sat');
const maputil = require('./mapgeneration/maputil.js');

let currentRoomID = 1;
const players = {};
const rooms = [];

module.exports = {
  getRooms() {
    return rooms;
  },
  getPlayers() {
    return players;
  },
  getCurrentRoomID() {
    return currentRoomID;
  },
  addPlayer(socketID, playerInfo) {
    const userInstance = {
      id: socketID,
      room: '',
      characterdata: playerInfo,
      x: 128,
      y: 128,
      stats: module.exports.calculateStatsForCharacter(playerInfo),
    };
    players[socketID] = userInstance;
    return userInstance;
  },
  makeRoom(player) {
    /* eslint no-param-reassign: "off"*/
    const room = {
      name: `room${currentRoomID}`,
      players: [],
      difficulty: 1,
      mapDescription: {
        filename: 'temp',
        startX: 5 * 64,
        startY: 5 * 64,
      },
      gameobjects: [], // Static objects that can't be
      enemies: [], // Enemies that can be harmed
      projectiles: [], // Projectiles
    };
    currentRoomID += 1;

    player.room = room.name;
    player.x = room.mapDescription.startX;
    player.y = room.mapDescription.startY;
    player.shape = new SAT.Box(new SAT.Vector(player.x,
      player.y), 32, 32);
    room.players.push(player);

    rooms.push(room);

    return room;
  },
  removeRoom(room) {
    rooms.splice(rooms.indexOf(room), 1);
  },
  addPlayerToRoom(player, room) {
    /* eslint no-param-reassign: "off"*/
    player.room = room.name;
    player.x = room.mapDescription.startX;
    player.y = room.mapDescription.startY;
    player.shape = new SAT.Box(new SAT.Vector(player.x,
      player.y), 32, 32);
    room.players.push(player);
  },
  removePlayerFromRoom(player, room) {
    room.players.splice(room.players.indexOf(player), 1);
    delete players[player.id];
  },
  removePlayer(player) {
    delete players[player.id];
  },
  removeGameobject(roomname, hash) {
    const room = rooms.find(x => x.name === roomname);
    const index = room.gameobjects.indexOf(room.gameobjects.find(x => x.hash === hash));
    room.gameobjects.splice(index, 1);
  },
  updatePlayerPosition(player, nx, ny) {
    /* eslint no-param-reassign: "off"*/
    player.x = nx;
    player.y = ny;
    player.shape = new SAT.Box(new SAT.Vector(player.x,
      player.y), 32, 32);
  },
  playerAttack(player, payload) {
    const projectile = { x: player.x + 16, y: player.y + 16, deltaX: 0, deltaY: 0 };

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

    const foundRoom = rooms.find(x => x.name === player.room);
    foundRoom.projectiles.push(projectile);
    return projectile;
  },
  playerLoot(player, lootbaghash, index) {
    const world = rooms.find(x => x.name === player.room);
    const lootbag = world.gameobjects.find(l => l.hash === lootbaghash);
    if (lootbag === undefined) {
      return undefined;
    }
    const itemwrapper = lootbag.lootbag.items[index];
    if (module.exports.addItemToInventory(player, itemwrapper)) {
      lootbag.lootbag.items.splice(index, 1);
      return lootbag.lootbag.items;
    }
    return undefined;
  },
  playerHasRoomInInventory(player) {
    const invReference = player.characterdata.inventory.data;
    for (let i = 1; i <= 20; i++) {
      if (invReference[i] === undefined) {
        return true;
      }
    }
    return false;
  },
  // Returns true if successful
  addItemToInventory(player, itemwrapper) {
    const invReference = player.characterdata.inventory.data;
    // Check jos on jo olemassa
    for (let i = 1; i <= 20; i++) {
      if (invReference[i] !== undefined) {
        if (invReference[i].uniqueid === itemwrapper.uniqueid) {
          invReference[i].amount += itemwrapper.amount;
          return true;
          // TODO: tell database
        }
      }
    }

    for (let i = 1; i <= 20; i++) {
      if (invReference[i] === undefined) {
        invReference[i] = itemwrapper;
        return true;
        // TODO: tell database
      }
    }
    return false;
  },
  removeItemFromInventory(player, slot, amount) {
    const invReference = player.characterdata.inventory.data;
    const itemReference = invReference[slot];
    if (itemReference !== undefined) {
      if (itemReference.amount > amount) {
        itemReference.amount -= amount;
        return true;
      }
      delete invReference[slot];
      return true;
    }
    return false;
  },
  equipItem(player, invslot) {
    const invReference = player.characterdata.inventory.data;
    const equipmentReference = player.characterdata.equipment.data;

    const equippedItemReference = invReference[invslot];

    if (equippedItemReference === undefined || equippedItemReference.uniqueid == -1) {
      return true;
    }

    if (equippedItemReference.data.itemtypeid < 0 || equippedItemReference.data.itemtypeid > 7) {
      // special item
      return true;
    }
    if (module.exports.unEquipItem(player, equippedItemReference.data.itemtypeid)) {
      equipmentReference[equippedItemReference.data.itemtypeid] = equippedItemReference.data;
      module.exports.removeItemFromInventory(player, invslot, 1);
      return true;
    }
    return false;
  },
  unEquipItem(player, slot) {
    const equipmentReference = player.characterdata.equipment.data;
    const unequippedItem = equipmentReference[slot];
    if (unequippedItem === undefined) {
      return true;
    }
    const unequippedItemWrapper = { amount: 1, uniqueid: unequippedItem.uniqueid, data: unequippedItem };
    if (module.exports.addItemToInventory(player, unequippedItemWrapper)) {
      delete equipmentReference[slot];
      return true;
    }
    return false;
  },
  calculateStatsForCharacter(playerData, currentHealth) {
    const baseStats = [
      {
        health: 5,
        dexterity: 2,
        strength: 12,
        vitality: 5,
        defence: 5,
        speed: 1,
      },
      {
        health: 3,
        dexterity: 4,
        strength: 7,
        vitality: 5,
        defence: 2,
        speed: 1,
      },
      {
        health: 6,
        dexterity: 1,
        strength: 10,
        vitality: 5,
        defence: 7,
        speed: 1,
      },
    ];
    const result = {
      health: (100 + (playerData.level * baseStats[playerData.cclass].health)),
      dexterity: (100 + (playerData.level * baseStats[playerData.cclass].dexterity)),
      strength: (100 + (playerData.level * baseStats[playerData.cclass].strength)),
      vitality: (100 + (playerData.level * baseStats[playerData.cclass].vitality)),
      defence: (100 + (playerData.level * baseStats[playerData.cclass].defence)),
      speed: (100 + (playerData.level * baseStats[playerData.cclass].speed)),
      maxhealth: (100 + (playerData.level * baseStats[playerData.cclass].health)),
    };

    if (currentHealth !== undefined) {
      result.health = currentHealth;
    }
    return result;
  },

};
