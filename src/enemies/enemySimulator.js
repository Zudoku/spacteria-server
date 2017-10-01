const PF = require('pathfinding');
const SAT = require('sat');
const terrainCollision = require('./../terraincollision.js');
const SF = require('./../staticFuncs.js');
const wanderingSimulator = require('./enemySimulatorWandering.js');


module.exports = {
  simulate(enemy, room, gameserver) {
    /* eslint no-param-reassign: "off"*/
    switch (enemy.type) {
      case 'dummy': {
        enemy.simulations++;
        return;
      }
      case 'wandering': {
        enemy.simulations++;
        wanderingSimulator.simulate(enemy, room, gameserver, this, terrainCollision);
        break;
      }
      default: {
        return;
      }
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
  enemylookForTarget(enemy, room) {
    // Go through every player and check if they are in radius
    for (let i = 0; i < room.players.length; i++) {
      const currentCheckedPlayer = room.players[i];
      const circle = new SAT.Circle(new SAT.Vector(enemy.x + (enemy.shape.w / 2), enemy.y + (enemy.shape.h / 2)), 100);
      if (currentCheckedPlayer.shape !== undefined && SAT.testPolygonCircle(currentCheckedPlayer.shape.toPolygon(), circle)) {
        enemy.target = currentCheckedPlayer;
        return true;
      }
    }

    return false;
  },

  shootProjectile(enemy, index, room, gameserver) {
    // Calculate the angle between the two
    // TODO: add the option to shoot multiple projectiles with one shot, like a shotgun
    const realEnemyPos = {
      x: enemy.shape.pos.x + (enemy.shape.w / 2),
      y: enemy.shape.pos.y + (enemy.shape.h / 2),
    };
    const realTargetPos = {
      x: enemy.target.shape.pos.x + (enemy.target.shape.w / 2),
      y: enemy.target.shape.pos.y + (enemy.target.shape.h / 2),
    };

    const angle = SF.angleBetweenTwoPoints(realEnemyPos, realTargetPos);

    const projectile = { x: enemy.x + (enemy.shape.w / 2), y: enemy.y + (enemy.shape.h / 2), deltaX: 0, deltaY: 0 };
    projectile.image = enemy.projectiles[index].image;
    projectile.team = 2;
    projectile.path = enemy.projectiles[index].path;
    projectile.speed = enemy.projectiles[index].speed;
    projectile.guid = SF.guid();
    projectile.collideToTerrain = enemy.projectiles[index].collideToTerrain;
    projectile.angle = angle;
    projectile.maxTravelDistance = enemy.projectiles[index].maxTravelDistance;
    projectile.travelDistance = 0;
    projectile.damage = enemy.projectiles[index].damage;
    projectile.shape = new SAT.Box(new SAT.Vector(projectile.x, projectile.y), 2, 2);
    room.projectiles.push(projectile);

    gameserver.broadcastProjectileSpawn(projectile, room);
  },
};
