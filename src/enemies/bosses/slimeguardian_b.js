const SF = require('./../../staticFuncs.js');
const SAT = require('sat');


const PHASE_NEUTRAL = 0;
const PHASE_AGGRO = 1;
const PHASE_DANCE = 2;
const PHASE_BLOB = 3;

const DANCE_ATTACK_INTERVAL = 30;

module.exports = {
  simulate(enemy, room, gameserver, enemySimulator, terrainCollision) {
    /* eslint no-param-reassign: "off"*/
    const simulationIndex = enemy.simulations;

    enemySimulator.regenLife(enemy);

    module.exports.checkIfDead(enemy, gameserver, room);

    switch (enemy.state) {
      case PHASE_NEUTRAL:
        module.exports.checkIfAggro(enemy, room, simulationIndex, gameserver);

        break;
      case PHASE_AGGRO:

        break;

      case PHASE_DANCE:
        if (enemy.extra.dying) {
          break;
        }
        module.exports.tryToCastRandomSlowProjectiles(enemy, room, gameserver, enemySimulator, false);
        break;

      case PHASE_BLOB:
        if (enemy.extra.dying) {
          break;
        }
        module.exports.tryToCastRandomSlowProjectiles(enemy, room, gameserver, enemySimulator, true);
        break;

      default:

        break;
    }
  },
  tryToCastRandomSlowProjectiles(enemy, room, gameserver, enemySimulator, fastMode) {
    const simulationIndex = enemy.simulations;

    const interval = fastMode ? (DANCE_ATTACK_INTERVAL / 2) : DANCE_ATTACK_INTERVAL;

    if (simulationIndex % interval === 0) {
      const target = room.players[SF.getRandomIntInclusive(0, room.players.length - 1)];

      const projectileDirection = SF.angleBetweenTwoPoints({ x: enemy.x + 64, y: enemy.y + 64 }, { x: target.x + 16, y: target.y + 16 });
      const projectileX = (enemy.x + 64);
      const projectileY = (enemy.y + 64);

      const projectileToSpawn = enemySimulator.getProjectile(enemy, 0);
      projectileToSpawn.x = projectileX;
      projectileToSpawn.y = projectileY;
      projectileToSpawn.shape = new SAT.Box(new SAT.Vector(projectileX, projectileY), projectileToSpawn.width, projectileToSpawn.height);
      projectileToSpawn.angle = projectileDirection;
      if (fastMode) {
        projectileToSpawn.speed *= 2;
      }
      room.projectiles.push(projectileToSpawn);

      gameserver.broadcastProjectileSpawn(projectileToSpawn, room);
    }
  },
  findBrother(room) {
    return room.enemies.find(x => x.type === 'slimeguardian_a');
  },
  checkIfDead(enemy, gameserver, room) {
    if (enemy.stats.health < 0.05 * enemy.stats.maxhealth) {
      enemy.extra.dying = true;
      enemy.stats.health = 1000000;
      enemy.stats.defence = 10000000;
      enemy.stats.maxhealth = enemy.stats.health;
      gameserver.broadcastChatMessageRoom('[RED]: Squish! ', 2, room);
    }
  },
  checkIfAggro(enemy, room, simulationIndex, gameserver) {
    if (enemy.stats.health < enemy.stats.maxhealth) {
      enemy.state = PHASE_AGGRO;
      module.exports.findBrother(room).state = PHASE_AGGRO;
      module.exports.findBrother(room).extra.phaseChangeCounter = simulationIndex + 300 + SF.getRandomIntInclusive(1, 300);
      gameserver.broadcastChatMessageRoom('[???]: ........ ', 2, room);
      setTimeout(() => {
        gameserver.broadcastChatMessageRoom('[???]: You don\'t belong here Alienoid', 2, room);
      }, 500);
      setTimeout(() => {
        gameserver.broadcastChatMessageRoom('[???]: Prepare to gelatinate!', 2, room);
      }, 500);
    }
  },
};
