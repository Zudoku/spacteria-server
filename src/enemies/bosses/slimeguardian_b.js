const SF = require('./../../staticFuncs.js');
const SAT = require('sat');


const PHASE_NEUTRAL = 0;
const PHASE_AGGRO = 1;
const PHASE_DANCE = 2;
const PHASE_BLOB = 3;
const PHASE_DYING = 4;

const DANCE_ATTACK_INTERVAL = 30;

module.exports = {
  simulate(enemy, room, gameserver, enemySimulator, terrainCollision) {
    /* eslint no-param-reassign: "off"*/
    const simulationIndex = enemy.simulations;

    enemySimulator.regenLife(enemy);

    if (enemy.stats.health < 0.05 * enemy.stats.maxhealth && enemy.state !== PHASE_DYING) {
      enemy.extra.dying = true;
      enemy.stats.health = 100000000000;
      enemy.stats.defence = 10000000;
      enemy.stats.maxhealth = enemy.stats.health;
    }
    switch (enemy.state) {
      case PHASE_NEUTRAL:

        if (enemy.stats.health < enemy.stats.maxhealth) {
          enemy.state = PHASE_AGGRO;
          module.exports.findBrother(room).state = PHASE_AGGRO;
          module.exports.findBrother(room).extra.phaseChangeCounter = simulationIndex + 300 + SF.getRandomIntInclusive(1, 300);
        }

        break;
      case PHASE_AGGRO:

        break;

      case PHASE_DANCE:
        module.exports.tryToCastRandomSlowProjectiles(enemy, room, gameserver, enemySimulator);
        break;

      case PHASE_BLOB:

        break;

      case PHASE_DYING:


        break;

      default:

        break;
    }
  },
  tryToCastRandomSlowProjectiles(enemy, room, gameserver, enemySimulator) {
    const simulationIndex = enemy.simulations;

    if (simulationIndex % DANCE_ATTACK_INTERVAL === 0) {
      const target = room.players[SF.getRandomIntInclusive(0, room.players.length - 1)];

      const projectileDirection = SF.angleBetweenTwoPoints({ x: enemy.x + 64, y: enemy.y + 64 }, { x: target.x + 16, y: target.y + 16 });
      const projectileX = (enemy.x + 64);
      const projectileY = (enemy.y + 64);

      const projectileToSpawn = enemySimulator.getProjectile(enemy, 0);
      projectileToSpawn.x = projectileX;
      projectileToSpawn.y = projectileY;
      projectileToSpawn.shape = new SAT.Box(new SAT.Vector(projectileX, projectileY - projectileToSpawn.height), projectileToSpawn.width, projectileToSpawn.height);
      projectileToSpawn.angle = projectileDirection;

      room.projectiles.push(projectileToSpawn);

      gameserver.broadcastProjectileSpawn(projectileToSpawn, room);
    }
  },
  findBrother(room) {
    return room.enemies.find(x => x.type === 'slimeguardian_a');
  },
};
