const enemies = require('./enemies/enemies.js');
const gameobjects = require('./gameobjects.js');
const SF = require('./staticFuncs.js');
const worldUtil = require('./worldUtil.js');

const mapDescs = require('./mapgeneration/data/mapdata.js');

module.exports = {
  initializeMap(room, id, terrainCollision, reset, maprooms) {
    // get map diameters
    const width = terrainCollision.getTypes(room.mapDescription.filename).width;
    const height = terrainCollision.getTypes(room.mapDescription.filename).height;
    const description = mapDescs[`${id}`];
    if (description === undefined) {
      console.log(`Unknown maptype: ${id} Cannot initialize game elements to map.`);
      return true;
    }
    if (reset) {
      /* eslint no-param-reassign: "off"*/
      room.gameobjects = [];
      room.enemies = [];
      room.projectiles = [];
    }
    room.zones = worldUtil.getZones(width, height);
    // Set players to right place
    if (description.spawn !== undefined) {
      room.mapDescription.startX = description.spawn.x;
      room.mapDescription.startY = description.spawn.y;
    } else {
      room.mapDescription.startX = 5 * 64;
      room.mapDescription.startY = 5 * 64;
    }
    // room.mapDescription.filename = id;
    for (let i = 0; i < room.players.length; i++) {
      const player = room.players[i];
      player.x = room.mapDescription.startX;
      player.y = room.mapDescription.startY;
      player.shape.x = room.mapDescription.startX;
      player.shape.y = room.mapDescription.startY;
    }

    // add position defined enemies
    for (let i = 0; i < description.enemies.length; i++) {
      if (description.enemies[i].x !== undefined && description.enemies[i].y !== undefined) {
        module.exports.tryToAddEnemy(room, description.enemies[i], 0, 0);
      }
    }

    // add enemies if there are rooms defined
    if (maprooms !== undefined) {
      // Add room defined enemies
      for (let i = 0; i < maprooms.length; i++) {
        const mapRoom = maprooms[i];
        for (let k = 0; k < description.enemies.length; k++) {
          const handledEnemy = description.enemies[k];
          if (handledEnemy.x === undefined || handledEnemy.y === undefined) {
            module.exports.tryToAddEnemy(room, handledEnemy, (mapRoom.x * 64) + 96, (mapRoom.y * 64) + 96);
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
    // add NPCs
    for (let i = 0; i < description.npcs.length; i++) {
      module.exports.tryToAddNPC(room, description.npcs[i], 0, 0);
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
        enemy.simulations = SF.getRandomIntInclusive(0, 1000);
        worldUtil.getZoneForCoord(room.zones, spawnX, spawnY).enemies[enemy.hash] = { shape: enemy.shape };
        enemy.zone = worldUtil.getZoneForCoord(room.zones, spawnX, spawnY);
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
  tryToAddNPC(room, NPCObj, x, y) {
    const spawnRoll = Math.random();
    if (NPCObj.prob >= spawnRoll) {
      let spawnX = (NPCObj.x !== undefined) ? NPCObj.x : x;
      let spawnY = (NPCObj.y !== undefined) ? NPCObj.y : y;
      spawnX = parseInt(spawnX, 10);
      spawnY = parseInt(spawnY, 10);
      const npc = gameobjects.getNPC(NPCObj.image, NPCObj.type, NPCObj.name, NPCObj.lines, spawnX, spawnY, NPCObj.width, NPCObj.height);
      room.gameobjects.push(npc);
    }
  },
  getDescs() {
    return mapDescs;
  },
};
