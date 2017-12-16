const SAT = require('sat');

const SF = require('./../../staticFuncs.js');
const enemies = require('./../enemies.js');
const worldUtil = require('./../../worldUtil.js');


const PHASE_NEUTRAL = 0;
const PHASE_AGGRO = 1;
const PHASE_DANCE = 2;
const PHASE_BLOB = 3;

const DANCE_RING_INTERVAL = 10;

module.exports = {
  simulate(enemy, room, gameserver, enemySimulator, terrainCollision) {
    /* eslint no-param-reassign: "off"*/
    const simulationIndex = enemy.simulations;

    enemySimulator.regenLife(enemy);

    module.exports.checkIfDead(enemy, gameserver, room);
    module.exports.checkBothDead(enemy, room);

    if (module.exports.shouldChangeState(enemy, simulationIndex)) {
      if (enemy.state !== PHASE_AGGRO) {
        enemy.state = PHASE_AGGRO;
        module.exports.findBrother(room).state = PHASE_AGGRO;
        enemy.extra.phaseChangeCounter = simulationIndex + 500;
        gameserver.broadcastChatMessageRoom(`[???]: ${enemy.stats.health} [???]: ${module.exports.findBrother(room).stats.health}`, 2, room);
      } else if (SF.getRandomIntInclusive(1, 2) === 1) {
        enemy.state = PHASE_DANCE;
        module.exports.findBrother(room).state = PHASE_DANCE;
        enemy.extra.phaseChangeCounter = simulationIndex + 1800;
        gameserver.broadcastChatMessageRoom('[???]: You can\'t escape us!', 2, room);
      } else {
        enemy.state = PHASE_BLOB;
        module.exports.findBrother(room).state = PHASE_BLOB;
        enemy.extra.phaseChangeCounter = simulationIndex + 1800;
        gameserver.broadcastChatMessageRoom('[???]: Arise our children!', 2, room);
      }
    }

    switch (enemy.state) {
      case PHASE_NEUTRAL:

        if (enemy.stats.health < enemy.stats.maxhealth) {
          enemy.state = PHASE_AGGRO;
          module.exports.findBrother(room).state = PHASE_AGGRO;
          enemy.extra.phaseChangeCounter = simulationIndex + 300 + SF.getRandomIntInclusive(1, 300);
          gameserver.broadcastChatMessageRoom('[???]: ........ ', 2, room);
          setTimeout(() => {
            gameserver.broadcastChatMessageRoom('[???]: You don\'t belong here Alienoid', 2, room);
          }, 500);
          setTimeout(() => {
            gameserver.broadcastChatMessageRoom('[???]: Prepare to gelatinate!', 2, room);
          }, 500);
        }

        break;
      case PHASE_AGGRO:

        break;

      case PHASE_DANCE:
        if (enemy.extra.dying) {
          break;
        }
        if (enemy.simulations % DANCE_RING_INTERVAL === 0) {
          module.exports.castDanceRing(enemy, room, gameserver, enemySimulator);
        }
        module.exports.tryToCastDanceProjectiles(enemy, room, gameserver, enemySimulator);
        break;

      case PHASE_BLOB:
        if (enemy.extra.dying) {
          break;
        }
        module.exports.tryToSpawnBlob(enemy, room, gameserver, enemySimulator, simulationIndex);
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
      projectileToSpawn.shape = new SAT.Box(new SAT.Vector(projectileX, projectileY), projectileToSpawn.width, projectileToSpawn.height);
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
      projectileToSpawn.shape = new SAT.Box(new SAT.Vector(projectileX, projectileY), projectileToSpawn.width, projectileToSpawn.height);
      projectileToSpawn.angle = projectileDirection;

      room.projectiles.push(projectileToSpawn);

      gameserver.broadcastProjectileSpawn(projectileToSpawn, room);
    }
  },
  findBrother(room) {
    return room.enemies.find(x => x.type === 'slimeguardian_b');
  },
  checkIfDead(enemy, gameserver, room) {
    if (enemy.stats.health < 0.05 * enemy.stats.maxhealth) {
      enemy.extra.dying = true;
      enemy.stats.health = 1000000;
      enemy.stats.defence = 10000000;
      enemy.stats.maxhealth = enemy.stats.health;
      gameserver.broadcastChatMessageRoom('[PURPLE]: Squish! ', 2, room);
    }
  },
  checkBothDead(enemy, room) {
    if (enemy.extra.dying && module.exports.findBrother(room).extra.dying) {
      const worldSimulator = require('./../../worldSimulator.js');
      worldSimulator.npcDie(enemy, room);
      worldSimulator.npcDie(module.exports.findBrother(room), room);
    }
  },
  shouldChangeState(enemy, simulationIndex) {
    return (enemy.extra.phaseChangeCounter <= simulationIndex && enemy.state !== PHASE_NEUTRAL);
  },
  tryToSpawnBlob(enemy, room, gameserver, enemySimulator, simulationIndex) {
    if (simulationIndex % 40 === 0) {
      const t = (2 * Math.PI) / (Math.random() + 0.001);
      const spawnX = enemy.x + (SF.getRandomIntInclusive(100, 500) * Math.cos(t));
      const spawnY = enemy.y + (SF.getRandomIntInclusive(100, 500) * Math.cos(t));

      const spawnedEnemy = enemies.getMonster('mini_gelatinous_blob', room.difficulty, spawnX, spawnY);
      spawnedEnemy.simulations = SF.getRandomIntInclusive(0, 1000);
      worldUtil.getZoneForCoord(room.zones, spawnX, spawnY).enemies[spawnedEnemy.hash] = { shape: spawnedEnemy.shape };
      spawnedEnemy.zone = worldUtil.getZoneForCoord(room.zones, spawnX, spawnY);
      spawnedEnemy.target = room.players[SF.getRandomIntInclusive(0, room.players.length - 1)];
      room.enemies.push(spawnedEnemy);
      gameserver.broadcastEnemyToGame(spawnedEnemy, spawnedEnemy.hash, room);
    }
  },
};
