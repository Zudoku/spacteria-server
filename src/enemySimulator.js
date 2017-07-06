const PF = require('pathfinding');
const SAT = require('sat');
const terrainCollision = require('./terraincollision.js');
const SF = require('./staticFuncs.js');


const NO_TARGET_FOUND = 0;
const TARGET_FOUND = 1;

function getRandomIntInclusive(min, max) {
  /* eslint no-mixed-operators: "off"*/
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  simulate(enemy, room, serverlogic) {
    /* eslint no-param-reassign: "off"*/
    switch (enemy.type) {
      case 'dummy': {
        enemy.simulations++;
        return;
      }
      case 'wandering': {
        enemy.simulations++;
        module.exports.wandering(enemy, room, serverlogic);
        break;
      }
      default: {
        return;
      }
    }
  },
  wandering(enemy, room, serverlogic) {
    // console.log(enemy.state);
    switch (enemy.state) {
      case NO_TARGET_FOUND: {
        /* eslint no-mixed-operators: "off"*/
        if (enemy.simulations % 10 === 0) {
          if (module.exports.enemylookForTarget(enemy, room)) {
            enemy.state = 1;

            return;
          }
        }
        if (enemy.moveTarget === undefined) {
          // Move somewhere
          const arrayPosX = Math.floor(((enemy.shape.pos.x - (enemy.shape.w / 2)) / 64) + getRandomIntInclusive(0, 2) - 1);
          const arrayPosY = Math.floor(((enemy.shape.pos.y - (enemy.shape.h / 2)) / 64) + getRandomIntInclusive(0, 2) - 1);

          if (!terrainCollision.isBlocked(arrayPosX, arrayPosY, room)) {
            enemy.moveTarget = { x: (arrayPosX * 64) + 32, y: (arrayPosY * 64) + 32 };
            // console.log(`movetarget found: ${enemy.moveTarget.x},${enemy.moveTarget.y}`);
          }
        } else {
          // if we are close, set moveTarget to undefined
          const deltaX = Math.abs(Math.abs(enemy.moveTarget.x) - Math.abs(enemy.shape.pos.x));
          const deltaY = Math.abs(Math.abs(enemy.moveTarget.y) - Math.abs(enemy.shape.pos.y));
          if (deltaX + deltaY < 6) {
            enemy.moveTarget = undefined;
          }
        }
        break;
      }
      case TARGET_FOUND: {
        // Move towards target
        const arrayPosXE = Math.floor(enemy.shape.pos.x / 64);
        const arrayPosYE = Math.floor(enemy.shape.pos.y / 64);
        const arrayPosXT = Math.floor(enemy.target.shape.pos.x / 64);
        const arrayPosYT = Math.floor(enemy.target.shape.pos.y / 64);
        const finder = new PF.AStarFinder();
        const grid = terrainCollision.getMapCloneForPF(room);

        if (!grid.isInside(arrayPosXE, arrayPosYE) || !grid.isInside(arrayPosXT, arrayPosYT)) {
          console.log('target outside map...');
          return;
        }

        const path = finder.findPath(arrayPosXE, arrayPosYE, arrayPosXT, arrayPosYT, grid);

        // console.log(path);

        if (path.length === 1) {
          enemy.moveTarget = { x: (path[0][0] * 64) + 32, y: (path[0][1] * 64) + 32 };
        }
        if (path.length > 1) {

          if (arrayPosXE === path[0][0] && arrayPosYE === path[0][1]) {
            enemy.moveTarget = { x: (path[1][0] * 64) + 32, y: (path[1][1] * 64) + 32 };
          } else {
            enemy.moveTarget = { x: (path[0][0] * 64) + 32, y: (path[0][1] * 64) + 32 };
          }
        }
        if (path === undefined || path.length === 0) {
          console.log(`cant find path for ${arrayPosXE},${arrayPosYE} and ${arrayPosXT},${arrayPosYT}`);
          enemy.moveTarget = undefined;
        }

        // module.exports.enemylookForTarget(enemy, room);
        // Shoot at target

        if (enemy.target !== undefined) {
          module.exports.tryToShootProjectiles(enemy, room, serverlogic);
        }

        break;
      }
      default: {
        break;
      }
    }
  },
  tryToShootProjectiles(enemy, room, serverlogic) {
    for (let i = 0; i < enemy.projectiles.length; i++) {
      const currentProjectile = enemy.projectiles[i];
      const thisTime = new Date().getTime();
      const projectileTime = currentProjectile.lastShotTime + currentProjectile.cooldown;
      // console.log(projectileTime);
      // console.log(thisTime);
      if (projectileTime < thisTime) {
        module.exports.shootProjectile(enemy, i, room, serverlogic);
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

  shootProjectile(enemy, index, room, serverlogic) {
    // Calculate the angle between the two
    // TODO: add the option to shoot multiple projectiles with one shot, like a shotgun
    const angle = SF.angleBetweenTwoPoints(enemy.shape.pos, enemy.target.shape.pos);

    const projectile = { x: enemy.x, y: enemy.y, deltaX: 0, deltaY: 0 };
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

    serverlogic.addProjectileToGame(projectile, room.name);
  },
};
