const SAT = require('sat');
const worldUtil = require('./worldUtil.js');

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
      stats: worldUtil.calculateStatsForCharacter(playerInfo),
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
        startY: 128,
        spent: 0,
      },
      roomState: 'PAUSED',
      gameobjects: [], // Static objects that can't be
      enemies: [], // Enemies that can be harmed
      projectiles: [], // Projectiles
      zones: worldUtil.getZones(20, 20),
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
    player.characterdata.status = 'ALIVE';
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
    const projectile = {
      deltaX: 0,
      deltaY: 0,
      image: 'BASIC',
      team: 1,
      path: 'STRAIGHT',
      speed: 130,
      guid: payload.projectile.guid,
      collideToTerrain: true,
      maxTravelDistance: 500,
      travelDistance: 0,
      damage: player.stats.strength,
      onTerrainCollision: undefined,
      width: 2,
      height: 2,
    };

    const projectileImgs = {
      0: 'BASIC',
      1: 'BLOBGUARDIAN',
      2: 'BLOBGUARDIANSLOW',
      3: 'CHARGER',
      4: 'SLIMEGUARDIANSLOW',
      5: 'MINIBLOB',
      6: 'GUN',
      7: 'ELECTRICITY',
      8: 'SPRAY',
      9: 'SPRAY2',
    };

    if (player.characterdata.equipment.data[3] !== undefined) {
      const weapon = player.characterdata.equipment.data[3];
      for (const attribute of weapon.attributes) {
        if (attribute.attributeid === 10) {
          if (projectileImgs[attribute.attributevalue] !== undefined) {
            projectile.image = projectileImgs[attribute.attributevalue];
          }
        }
        if (attribute.attributeid === 11) {
          projectile.speed = attribute.attributevalue;
        }
        if (attribute.attributeid === 12) {
          projectile.maxTravelDistance = attribute.attributevalue;
        }
      }
    }


    projectile.x = payload.projectile.x;
    projectile.y = payload.projectile.y;
    projectile.angle = payload.projectile.angle % 360;
    projectile.shape = new SAT.Box(new SAT.Vector(projectile.x, projectile.y), projectile.width, projectile.height);


    const foundRoom = rooms.find(x => x.name === player.room);
    projectile.zone = worldUtil.getZoneForCoord(foundRoom.zones, projectile.x, projectile.y);
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
    if (itemwrapper.uniqueid === -1) {
      player.characterdata.currencies.coin += itemwrapper.amount;
      lootbag.lootbag.items.splice(index, 1);
      worldUtil.tryToSaveItemData(player, false, false, true);
      return lootbag.lootbag.items;
    }
    if (module.exports.addItemToInventory(player, itemwrapper)) {
      lootbag.lootbag.items.splice(index, 1);
      worldUtil.tryToSaveItemData(player, false, true, false);
      return lootbag.lootbag.items;
    }
    return undefined;
  },
  playerDropItem(player, slot, amount) {
    const result = module.exports.removeItemFromInventory(player, slot, amount);
    worldUtil.tryToSaveItemData(player, false, true);
    return result;
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
      if (invReference[i] !== undefined && itemwrapper.data.stackable) {
        if (invReference[i].uniqueid === itemwrapper.uniqueid) {
          invReference[i].amount += itemwrapper.amount;
          return true;
        }
      }
    }

    for (let i = 1; i <= 20; i++) {
      if (invReference[i] === undefined) {
        invReference[i] = itemwrapper;
        return true;
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

    if (equippedItemReference === undefined || equippedItemReference.uniqueid === -1) {
      return true;
    }

    if (equippedItemReference.data.itemtypeid < 0 || equippedItemReference.data.itemtypeid > 7) {
      // special item
      return true;
    }
    if (equippedItemReference.data.levelreq > player.characterdata.level) {
      return false;
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
  sellItem(player, slot) {
    const invReference = player.characterdata.inventory.data;
    const soldItem = invReference[slot];
    if (module.exports.removeItemFromInventory(player, slot, 1)) {
      player.characterdata.currencies.coin += soldItem.data.sellvalue;
      return true;
    }
    return false;
  },
};
