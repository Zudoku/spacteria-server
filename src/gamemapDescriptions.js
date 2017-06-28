const enemies = require('./enemies.js');
const gameobjects = require('./gameobjects.js');

const mapDescs = {
  1: {
    portals: [{ id: 2, prob: 1.0, x: 2 * 64, y: 18 * 64 }],
    npcs: [],
    enemies: [],
    lootbags: [],
    tiledata: undefined,
    width: 20,
    height: 20,
  },
  2: {
    portals: [{ id: 1, prob: 1.0, x: 3 * 64, y: 3 * 64 }, { id: 2, prob: 1.0 }],
    npcs: [],
    enemies: [{ id: 'small_guy', amount: 1, prob: 1.0 }],
    lootbags: [],
    generationData: {
      minroomheight: 2,
      maxroomheight: 6,
      minroomwidth: 2,
      maxroomwidth: 6,
      minroomamount: 1,
      maxroomamount: 1,
      minroomdistance: 3,
      maxroomdistance: 20,
      width: 20,
      height: 20,
      tiles: {
        floor: 21,
        wall: 4,
        path: 3,
      },
    },
    width: 20,
    height: 20,
  },
};

module.exports = {
  initializeMap(room, id, terrainCollision, reset, maprooms, cb) {
    // get map diameters
    const width = terrainCollision.getTypes(room.mapDescription.filename).width;
    const height = terrainCollision.getTypes(room.mapDescription.filename).height;
    const description = mapDescs[`${id}`];
    if (description === undefined) {
      console.log(`Unknown maptype: ${id} Cannot initialize game elements to map.`);
      return true;
    }
    if (reset) {
      room.gameobjects = [];
      room.enemies = [];
      room.projectiles = [];
    }
    // Set players to right place
    for (let i = 0; i < room.players.length; i++) {
      const player = room.players[i];
      player.x = room.mapDescription.startX;
      player.y = room.mapDescription.startY;
      player.shape.x = room.mapDescription.startX;
      player.shape.y = room.mapDescription.startY;
    }

    // add enemies if there are rooms defined
    if (maprooms !== undefined) {
      // add position defined enemies
      for (let i = 0; i < description.enemies.length; i++) {
        if (description.enemies[i].x !== undefined && description.enemies[i].y !== undefined) {
          module.exports.tryToAddEnemy(room, description.enemies[i], 0, 0);
        }
      }
      // Add room defined enemies
      for (let i = 0; i < maprooms.length; i++) {
        const mapRoom = maprooms[i];
        for (let k = 0; k < description.enemies.length; k++) {
          const handledEnemy = description.enemies[k];
          if (handledEnemy.x === undefined || handledEnemy.y === undefined) {
            module.exports.tryToAddEnemy(room, handledEnemy, mapRoom.x * 64 + 96, mapRoom.y * 64 + 96);
          }
        }
      }
    }


    // add portals
    for (let i = 0; i < description.portals.length; i++) {
      if (maprooms !== undefined) {
        const lastRoom = maprooms[maprooms.length - 1];

        module.exports.tryToAddPortal(room, description.portals[i], lastRoom.x * 64, lastRoom.y * 64);
      } else {
        module.exports.tryToAddPortal(room, description.portals[i], 0, 0);
      }
    }
    console.log(`Enemies + portals + players initialized for map ${room.mapDescription.filename}`);
    return true;
  },
  tryToAddEnemy(room, enemyObj, x, y) {
    const spawnRoll = Math.random();
    if (enemyObj.prob >= spawnRoll) {
      let spawnX = (enemyObj.x !== undefined) ? enemyObj.x : x;
      let spawnY = (enemyObj.y !== undefined) ? enemyObj.y : y;
      spawnX = parseInt(spawnX, 10);
      spawnY = parseInt(spawnY, 10);
      for (let o = 0; o < enemyObj.amount; o++) {
        const enemy = enemies.getMonster(enemyObj.id, room.difficulty, spawnX, spawnY);
        room.enemies.push(enemy);
      }
    }
  },
  tryToAddPortal(room, portalObj, x, y) {
    const spawnRoll = Math.random();
    if (portalObj.prob >= spawnRoll) {
      let spawnX = (portalObj.x !== undefined) ? portalObj.x : x;
      let spawnY = (portalObj.y !== undefined) ? portalObj.y : y;
      spawnX = parseInt(spawnX, 10);
      spawnY = parseInt(spawnY, 10);
      const portal = gameobjects.getPortal(portalObj.id, spawnX, spawnY);
      room.gameobjects.push(portal);
    }
  },
  getDescs() {
    return mapDescs;
  },
};
