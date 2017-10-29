const SF = require('./../../staticFuncs.js');
const SAT = require('sat');


const PHASE_NEUTRAL = 0;
const PHASE_AGGRO = 1;
const PHASE_DANCE = 2;
const PHASE_BLOB = 3;
const PHASE_DYING = 4;

const DANCE_RING_INTERVAL = 10;

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

    if (enemy.extra.phaseChangeCounter <= simulationIndex && enemy.state !== PHASE_NEUTRAL) {
      if (SF.getRandomIntInclusive(1, 2) === 1) {
        enemy.state = PHASE_DANCE;
        module.exports.findBrother(room).state = PHASE_DANCE;
        enemy.extra.phaseChangeCounter = simulationIndex + 1800;
        module.exports.castDanceRing(enemy, room, gameserver, enemySimulator);
      } else {
        enemy.state = PHASE_DANCE;
        module.exports.findBrother(room).state = PHASE_DANCE;
        enemy.extra.phaseChangeCounter = simulationIndex + 1800;
        module.exports.castDanceRing(enemy, room, gameserver, enemySimulator);
      }
    }

    switch (enemy.state) {
      case PHASE_NEUTRAL:

        if (enemy.stats.health < enemy.stats.maxhealth) {
          enemy.state = PHASE_AGGRO;
          module.exports.findBrother(room).state = PHASE_AGGRO;
          enemy.extra.phaseChangeCounter = simulationIndex + 300 + SF.getRandomIntInclusive(1, 300);
        }

        break;
      case PHASE_AGGRO:

        break;

      case PHASE_DANCE:
        if (enemy.simulations % DANCE_RING_INTERVAL === 0) {
          module.exports.castDanceRing(enemy, room, gameserver, enemySimulator);
        }
        module.exports.tryToCastDanceProjectiles(enemy, room, gameserver, enemySimulator);
        break;

      case PHASE_BLOB:

        break;

      case PHASE_DYING:


        break;

      default:

        break;
    }
  },
  castDanceRing(enemy, room, gameserver, enemySimulator) {
    const radius = 500;
    const POINT_AMOUNT = 10;
    for (let index = 0; index < POINT_AMOUNT; index++) {
      const t = index * ((2 * Math.PI) / POINT_AMOUNT); // IN RADIAN
      const circleX = radius * Math.cos(t);
      const circleY = radius * Math.sin(t);
      const projectileDirection = 80 + SF.getRandomIntInclusive(0, 20) + SF.angleBetweenTwoPoints({ x: circleX, y: circleY }, { x: 0, y: 0 });
      const offsetX = enemy.x + (3 * 64);
      const offsetY = enemy.y + 64;
      const projectileX = offsetX + circleX;
      const projectileY = offsetY + circleY;

      const projectileToSpawn = enemySimulator.getProjectile(enemy, 0);
      projectileToSpawn.x = projectileX;
      projectileToSpawn.y = projectileY;
      projectileToSpawn.shape = new SAT.Box(new SAT.Vector(projectileX, projectileY - projectileToSpawn.height), projectileToSpawn.width, projectileToSpawn.height);
      projectileToSpawn.angle = projectileDirection;

      room.projectiles.push(projectileToSpawn);

      gameserver.broadcastProjectileSpawn(projectileToSpawn, room);
    }
  },
  tryToCastDanceProjectiles(enemy, room, gameserver, enemySimulator) {
    const simulationIndex = enemy.simulations;

    const projectileIndex = simulationIndex % 40;

    if (projectileIndex % 2 === 0) {
      let realIndex = projectileIndex / 2;
      realIndex = (19 + realIndex + SF.getRandomIntInclusive(-1, 1)) % 20;
      const t = realIndex * ((2 * Math.PI) / 20);
      const circleX = 100 * Math.cos(t);
      const circleY = 100 * Math.sin(t);
      const projectileDirection = SF.angleBetweenTwoPoints({ x: circleX, y: circleY }, { x: 0, y: 0 });
      const projectileX = (enemy.x + 64);
      const projectileY = (enemy.y + 64);

      const projectileToSpawn = enemySimulator.getProjectile(enemy, 1);
      projectileToSpawn.x = projectileX;
      projectileToSpawn.y = projectileY;
      projectileToSpawn.shape = new SAT.Box(new SAT.Vector(projectileX, projectileY - projectileToSpawn.height), projectileToSpawn.width, projectileToSpawn.height);
      projectileToSpawn.angle = projectileDirection;

      room.projectiles.push(projectileToSpawn);

      gameserver.broadcastProjectileSpawn(projectileToSpawn, room);
    }
  },
  findBrother(room) {
    return room.enemies.find(x => x.type === 'slimeguardian_b');
  },
};
