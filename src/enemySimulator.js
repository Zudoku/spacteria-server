const PF = require('pathfinding');
const terrainCollision = require('./terraincollision.js');

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
            enemy.moveTarget = { x: arrayPosX * 64, y: arrayPosY * 64 };
            console.log('movetarget found');
          }
        } else {
          // if we are close, set moveTarget to undefined
          const deltaX = Math.abs(Math.abs(enemy.moveTarget.x * 64 + 32) - Math.abs(enemy.shape.pos.x + (enemy.shape.w / 2)));
          const deltaY = Math.abs(Math.abs(enemy.moveTarget.y * 64 + 32) - Math.abs(enemy.shape.pos.y + (enemy.shape.h / 2)));
          if (deltaX + deltaY < 6) {
            enemy.moveTarget = undefined;
          }
        }
        break;
      }
      case 1: {
        // Move towards target
        // Shoot at target
        break;
      }
      default: {
        break;
      }
    }
  },
  enemylookForTarget(enemy, room) {
    return false;
  },
};
