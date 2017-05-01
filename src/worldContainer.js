const SAT = require('sat');

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
      stats: {
        health: 100000,
      },
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
        filename: 'temp.tmx',
        startX: 128,
        startY: 128,
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
  updatePlayerPosition(player, nx, ny) {
    /* eslint no-param-reassign: "off"*/
    player.x = nx;
    player.y = ny;
    player.shape = new SAT.Box(new SAT.Vector(player.x,
      player.y), 32, 32);
  },
  playerAttack(player, payload) {
    const projectile = { x: player.x, y: player.y, deltaX: 0, deltaY: 0 };

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
    const world = rooms.find(x => x.name === player.world);
    console.log(world);
    console.log(player);
    const lootbag = world.gameobjects.find(l => l.hash === lootbaghash);

    const itemwrapper = lootbag.lootbag.items[index];
    if (module.exports.addItemToInventory(player, itemwrapper)) {
      lootbag.lootbag.splice(index, 1);

      if (lootbag.lootbag.items.length === 0) {
        // broadcast remove
      }
      // TODO: broadcast change
    }
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

  },

};
