const PF = require('pathfinding');
const SAT = require('sat');
const terrainCollision = require('./terraincollision.js');
const SF = require('./staticFuncs.js');


const NO_TARGET_FOUND = 0;
const TARGET_FOUND = 1;

const AI_TILE_CORNER_BUFFER = 16;
const AI_MOVETARGET_BUFFER = 6;

const AI_TARGET_SEARCH_FREQ = 18;
const AI_MOVE_RANDOMLY_FREQ = 22;

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
    const simulationIndex = enemy.simulations + parseInt(enemy.hash.substring(0, 3), 10);
    switch (enemy.state) {
      case NO_TARGET_FOUND: {
        /* eslint no-mixed-operators: "off"*/
        if (simulationIndex % AI_TARGET_SEARCH_FREQ === 0) {
          if (module.exports.enemylookForTarget(enemy, room)) {
            enemy.state = TARGET_FOUND;

            return;
          }
        }
        if (enemy.moveTarget === undefined) {
          if (simulationIndex % AI_MOVE_RANDOMLY_FREQ !== 0) {
            return;
          }
          // Move somewhere
          let arrayPosX = Math.floor(((enemy.shape.pos.x) / 64));
          let arrayPosY = Math.floor(((enemy.shape.pos.y) / 64));

          if (SF.getRandomIntInclusive(0, 1) === 0) {
            arrayPosX += (SF.getRandomIntInclusive(0, 2) - 1);
          } else {
            arrayPosY += (SF.getRandomIntInclusive(0, 2) - 1);
          }

          if (!terrainCollision.isBlocked(arrayPosX, arrayPosY, room) && terrainCollision.isInsideRoom(arrayPosX, arrayPosY, room)) {
            enemy.moveTarget = { x: (arrayPosX * 64) + 16, y: (arrayPosY * 64) + 16 };
            // console.log(`movetarget found: ${enemy.moveTarget.x},${enemy.moveTarget.y}`);
          }
        } else {
          // if we are close, set moveTarget to undefined
          const deltaX = Math.abs(Math.abs(enemy.moveTarget.x) - Math.abs(enemy.shape.pos.x));
          const deltaY = Math.abs(Math.abs(enemy.moveTarget.y) - Math.abs(enemy.shape.pos.y));
          if (deltaX + deltaY < AI_MOVETARGET_BUFFER) {
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

        // Shoot at target

        if (enemy.target !== undefined) {
          module.exports.tryToShootProjectiles(enemy, room, serverlogic);
        }

        if (simulationIndex % 10 !== 0) {
          return;
        }

        if (!grid.isInside(arrayPosXE, arrayPosYE) || !grid.isInside(arrayPosXT, arrayPosYT)) {
          console.log('target outside map...');
          return;
        }

        const path = finder.findPath(arrayPosXE, arrayPosYE, arrayPosXT, arrayPosYT, grid);

        // console.log(path);

        if (path.length === 1) {
          enemy.moveTarget = { x: (path[0][0] * 64) + AI_TILE_CORNER_BUFFER, y: (path[0][1] * 64) + AI_TILE_CORNER_BUFFER };
        }
        if (path.length > 1) {
          if (arrayPosXE === path[0][0] && arrayPosYE === path[0][1]) {
            enemy.moveTarget = { x: (path[1][0] * 64) + AI_TILE_CORNER_BUFFER, y: (path[1][1] * 64) + AI_TILE_CORNER_BUFFER };
          } else {
            enemy.moveTarget = { x: (path[0][0] * 64) + AI_TILE_CORNER_BUFFER, y: (path[0][1] * 64) + AI_TILE_CORNER_BUFFER };
          }
        }
        if (path === undefined || path.length === 0) {
          console.log(`cant find path for ${arrayPosXE},${arrayPosYE} and ${arrayPosXT},${arrayPosYT}`);
          enemy.moveTarget = undefined;
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

    const projectile = { x: enemy.x + (enemy.shape.w / 2), y: enemy.y + (enemy.shape.h), deltaX: 0, deltaY: 0 };
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
