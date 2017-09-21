const enemies = require('./enemies.js');
const gameobjects = require('./gameobjects.js');

const mapDescs = require('./mapgeneration/data/mapdata.js');

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
        module.exports.tryToAddPortal(room, description.portals[i], (lastRoom.x + i) * 64, lastRoom.y * 64);
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
