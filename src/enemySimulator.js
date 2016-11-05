const PF = require('pathfinding');
const SAT = require('sat');
const terrainCollision = require('./terraincollision.js');
const finder = new PF.AStarFinder();

function getRandomIntInclusive(min, max) {
  /* eslint no-mixed-operators: "off"*/
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  simulate(enemy, room, tilemap) {
    /* eslint no-param-reassign: "off"*/
    switch (enemy.type) {
      case 'dummy': {
        enemy.simulations++;
        return;
      }
      case 'wandering': {
        enemy.simulations++;
        module.exports.wandering(enemy, room, tilemap);
        break;
      }
      default: {
        return;
      }
    }
  },
  wandering(enemy, room) {
    // console.log(enemy.state);
    switch (enemy.state) {
      case 0: {
        /* eslint no-mixed-operators: "off"*/
        if (enemy.simulations % 10 === 0) {
          if (module.exports.enemylookForTarget(enemy, room)) {
            enemy.state = 1;
            console.log('returning');
            return;
          }
        }
        if (enemy.moveTarget === undefined) {
          // Move somewhere
          const arrayPosX = Math.floor(((enemy.shape.pos.x - (enemy.shape.w / 2)) / 64) + getRandomIntInclusive(0, 2) - 1);
          const arrayPosY = Math.floor(((enemy.shape.pos.y - (enemy.shape.h / 2)) / 64) + getRandomIntInclusive(0, 2) - 1);

          if (!terrainCollision.isBlocked(arrayPosX, arrayPosY, room)) {
            enemy.moveTarget = { x: (arrayPosX * 64) + 32, y: (arrayPosY * 64) + 32 };
            console.log(`movetarget found: ${enemy.moveTarget.x},${enemy.moveTarget.y}`);
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
      case 1: {
        // Move towards target
        const arrayPosXE = Math.floor(enemy.shape.pos.x / 64);
        const arrayPosYE = Math.floor(enemy.shape.pos.y / 64);
        const arrayPosXT = Math.floor(enemy.target.x / 64);
        const arrayPosYT = Math.floor(enemy.target.y / 64);
        var path = finder.findPath(arrayPosXE, arrayPosYE, arrayPosXT, arrayPosYT, pathfinding.getMapClone(room));
        if (path.length === 1) {
          enemy.moveTarget = { x: path[0][0], y: path[0][1] };
        }
        if (path.length > 1) {
          enemy.moveTarget = { x: path[1][0], y: path[1][1] };
        }
        if (path === undefined || path.length === 0) {
          enemy.moveTarget = undefined;
        }
        // Shoot at target
        break;
      }
      default: {
        break;
      }
    }
  },
  enemylookForTarget(enemy, room) {

    // Go through every player and check if they are in radius
    for(var i = 0; i < room.players.length; i++) {
      let currentCheckedPlayer = room.players[i];
      const circle = SAT.circle(new SAT.Vector(enemy.x + (enemy.shape.w / 2), enemy.y + (enemy.shape.h / 2)), 100);
      if (SAT.testPolygonCircle(currentCheckedPlayer.shape.toPolygon(), circle)
    }

    return false;
  },
};
