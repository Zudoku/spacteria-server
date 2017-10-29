const SAT = require('sat');
const terrainCollision = require('./../terraincollision.js');
const SF = require('./../staticFuncs.js');
const wanderingSimulator = require('./enemySimulatorWandering.js');
const staticSimulator = require('./enemySimulatorStatic.js');
const slimeguardiana = require('./bosses/slimeguardian_a.js');
const slimeguardianb = require('./bosses/slimeguardian_b.js');

const simulatorMap = {
  wandering: wanderingSimulator,
  static: staticSimulator,
  slimeguardian_a: slimeguardiana,
  slimeguardian_b: slimeguardianb,
};


module.exports = {
  simulate(enemy, room, gameserver) {
    enemy.simulations++;

    const foundSimulator = simulatorMap[enemy.type];
    if (foundSimulator !== undefined) {
      foundSimulator.simulate(enemy, room, gameserver, this, terrainCollision);
    }
  },
  tryToShootProjectiles(enemy, room, gameserver) {
    for (let i = 0; i < enemy.projectiles.length; i++) {
      const currentProjectile = enemy.projectiles[i];
      const thisTime = new Date().getTime();
      const projectileTime = currentProjectile.lastShotTime + currentProjectile.cooldown;
      if (projectileTime < thisTime) {
        module.exports.shootProjectile(enemy, i, room, gameserver);
        currentProjectile.lastShotTime = thisTime;
      }
    }
  },
  enemylookForTarget(enemy, room, radius) {
    // Go through every player and check if they are in radius
    for (let i = 0; i < room.players.length; i++) {
      const currentCheckedPlayer = room.players[i];
      const circle = new SAT.Circle(new SAT.Vector(enemy.x + (enemy.shape.w / 2), enemy.y + (enemy.shape.h / 2)), radius);
      if (currentCheckedPlayer.shape !== undefined && SAT.testPolygonCircle(currentCheckedPlayer.shape.toPolygon(), circle)) {
        enemy.target = currentCheckedPlayer;
        return true;
      }
    }

    return false;
  },

  shootProjectile(enemy, index, room, gameserver) {
    // Calculate the angle between the two
    const realEnemyPos = {
      x: enemy.x + (enemy.shape.w / 2),
      y: enemy.y + (enemy.shape.h / 2),
    };
    const realTargetPos = {
      x: enemy.target.x + (enemy.target.shape.w / 2),
      y: enemy.target.y + (enemy.target.shape.h / 2),
    };

    const angle = SF.angleBetweenTwoPoints(realEnemyPos, realTargetPos);

    const projectile = module.exports.getProjectile(enemy, index);
    projectile.x = enemy.x + (enemy.shape.w / 2);
    projectile.y = enemy.y + (enemy.shape.h / 2);
    projectile.angle = angle;
    projectile.shape = new SAT.Box(new SAT.Vector(projectile.x, projectile.y - projectile.height), projectile.width, projectile.height);
    room.projectiles.push(projectile);

    gameserver.broadcastProjectileSpawn(projectile, room);
  },
  getProjectile(enemy, index) {
    const projectile = {
      deltaX: 0,
      deltaY: 0,
      image: enemy.projectiles[index].image,
      team: 2,
      path: enemy.projectiles[index].path,
      speed: enemy.projectiles[index].speed,
      guid: SF.guid(),
      collideToTerrain: enemy.projectiles[index].collideToTerrain,
      maxTravelDistance: enemy.projectiles[index].maxTravelDistance,
      travelDistance: 0,
      damage: enemy.projectiles[index].damage,
      onTerrainCollision: enemy.projectiles[index].onTerrainCollision,
      width: enemy.projectiles[index].width,
      height: enemy.projectiles[index].height,
    };
    return projectile;
  },
  regenLife(enemy) {
    const simulationIndex = enemy.simulations;

    if (simulationIndex % 60 === 0) {
      if (enemy.stats.health !== enemy.stats.maxhhealth) {
        enemy.stats.health += enemy.stats.vitality;
        // Cant generate over maxhealth
        if (enemy.stats.health > enemy.stats.maxhhealth) {
          enemy.stats.health = enemy.stats.maxhealth;
        }
      }
    }
  },
};
