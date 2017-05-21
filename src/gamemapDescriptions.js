const enemies = require('./enemies.js');
const gameobjects = require('./gameobjects.js');

const mapDescs = {
  "1": {
    portals : [{ id: 2, prob: 1.0, x: 2 * 64, y: 18 * 64 }],
    npcs: [],
    enemies: [{ id: "small_guy", amount: 1, prob: 1.0 }],
    lootbags: [],
  },
  "2": {
    portals : [{ id: 2, prob: 1.0 }],
    npcs: [],
    enemies: [{ id: "small_guy", amount: 2, prob: 1.0 },{ id: "small_guy", amount: 4, prob: 0.5 }],
    lootbags: [],
  },
};

module.exports = {
  initializeMap(room, id, terrainCollision) {
    // get map diameters
    const width = terrainCollision.getTypes(room.mapDescription.filename).width;
    const height = terrainCollision.getTypes(room.mapDescription.filename).height;
    const description = mapDescs["" + id];
    if(description === undefined) {
      console.log("Unknown maptype: " + id + " Cannot initialize game elements to map.");
      return;
    }
    // add enemies
    for (let i = 0; i < description.enemies.length; i++) {
      module.exports.tryToAddEnemy(room, description.enemies[i], width, height);
    }
    // add portals
    for (let i = 0; i < description.portals.length; i++) {
      module.exports.tryToAddPortal(room, description.portals[i], width, height);
    }
  },
  tryToAddEnemy(room, enemyObj, width, height) {
    const spawnRoll = Math.random();
    if(enemyObj.prob >= spawnRoll) {
      const spawnX = (enemyObj.x !== undefined) ? enemyObj.x : 64 * (width - 1) * Math.random() + 64;
      const spawnY = (enemyObj.y !== undefined) ? enemyObj.y : 64 * (height - 1) * Math.random() + 64;

      for (let o = 0; o < enemyObj.amount; o++) {
         const enemy = enemies.getMonster(enemyObj.id, room.difficulty, spawnX, spawnY);
         room.enemies.push(enemy);
      }
    }
  },
  tryToAddPortal(room, portalObj, width, height) {
    const spawnRoll = Math.random();
    if(portalObj.prob >= spawnRoll) {
      const spawnX = (portalObj.x != undefined) ? portalObj.x: 64 * (width - 1) * Math.random + 64;
      const spawnY = (portalObj.y != undefined) ? portalObj.y: 64 * (height - 1) * Math.random + 64;
      const portal = gameobjects.getPortal(portalObj.id, spawnX, spawnY);
      room.gameobjects.push(portal);
    }
  },
};
