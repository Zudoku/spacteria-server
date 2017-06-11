const enemies = require('./enemies.js');
const gameobjects = require('./gameobjects.js');

const mapDescs = {
  "1": {
    portals : [{ id: 2, prob: 1.0, x: 2 * 64, y: 18 * 64 }],
    npcs: [],
    enemies: [{ id: "small_guy", amount: 1, prob: 1.0 }],
    lootbags: [],
    tiledata: undefined,
    width: 20,
    height: 20,
  },
  "2": {
    portals : [{ id: 2, prob: 1.0 }],
    npcs: [],
    enemies: [{ id: "small_guy", amount: 2, prob: 1.0 },{ id: "small_guy", amount: 4, prob: 0.5 }],
    lootbags: [],
    tiledata: require('./mapgeneration/data/castle.js'),
    width: 50,
    height: 50 ,
  },
};

module.exports = {
  initializeMap(room, id, terrainCollision, reset) {
    // get map diameters
    const width = terrainCollision.getTypes(room.mapDescription.filename).width;
    const height = terrainCollision.getTypes(room.mapDescription.filename).height;
    const description = mapDescs["" + id];
    if(description === undefined) {
      console.log("Unknown maptype: " + id + " Cannot initialize game elements to map.");
      return;
    }
    if(reset) {
      room.gameobjects = [];
      room.enemies = [];
      room.projectiles = [];
    }
    //Set players to right place
    for(let i = 0; i < room.players.length; i++) {
      const player = room.players[i];
      player.x = room.mapDescription.startX;
      player.y = room.mapDescription.startY;
      player.shape.x = room.mapDescription.startX;
      player.shape.y = room.mapDescription.startY;
    }

    room.mapDescription.filename

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
      let spawnX = (enemyObj.x !== undefined) ? enemyObj.x : 64 * (width - 1) * Math.random() + 64;
      let spawnY = (enemyObj.y !== undefined) ? enemyObj.y : 64 * (height - 1) * Math.random() + 64;
      spawnX = parseInt(spawnX);
      spawnY = parseInt(spawnY);
      for (let o = 0; o < enemyObj.amount; o++) {
         const enemy = enemies.getMonster(enemyObj.id, room.difficulty, spawnX, spawnY);
         room.enemies.push(enemy);
      }
    }
  },
  tryToAddPortal(room, portalObj, width, height) {
    const spawnRoll = Math.random();
    if(portalObj.prob >= spawnRoll) {
      let spawnX = (portalObj.x != undefined) ? portalObj.x: 64 * (width - 1) * Math.random() + 64;
      let spawnY = (portalObj.y != undefined) ? portalObj.y: 64 * (height - 1) * Math.random() + 64;
      spawnX = parseInt(spawnX);
      spawnY = parseInt(spawnY);
      const portal = gameobjects.getPortal(portalObj.id, spawnX, spawnY);
      room.gameobjects.push(portal);
    }
  },
  getDescs() {
    return mapDescs;
  },
};
