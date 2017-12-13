const SF = require('./../../staticFuncs.js');
const SAT = require('sat');

const DANCE_RING_INTERVAL = 30;

module.exports = {
  simulate(enemy, room, gameserver, enemySimulator, terrainCollision) {
    /* eslint no-param-reassign: "off"*/

    if (enemy.simulations % DANCE_RING_INTERVAL === 0) {
      // module.exports.castDanceRing(enemy, room, gameserver, enemySimulator);
      const target = room.players[SF.getRandomIntInclusive(0, room.players.length - 1)];

      const projectileDirection = SF.angleBetweenTwoPoints({ x: enemy.x, y: enemy.y }, { x: target.x, y: target.y });
      const projectileX = (enemy.x);
      const projectileY = (enemy.y);

      const projectileToSpawn = enemySimulator.getProjectile(enemy, 0);
      projectileToSpawn.x = projectileX;
      projectileToSpawn.y = projectileY;
      projectileToSpawn.shape = new SAT.Box(new SAT.Vector(projectileX, projectileY), projectileToSpawn.width, projectileToSpawn.height);
      projectileToSpawn.angle = projectileDirection;

      room.projectiles.push(projectileToSpawn);

      gameserver.broadcastProjectileSpawn(projectileToSpawn, room);
    }
  },
};
