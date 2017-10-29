const SF = require('./../staticFuncs.js');
const PF = require('pathfinding');

const NO_TARGET_FOUND = 0;
const TARGET_FOUND = 1;

const AI_TILE_CORNER_BUFFER = 16;
const AI_MOVETARGET_BUFFER = 6;

const AI_TARGET_SEARCH_FREQ = 18;
const AI_MOVE_RANDOMLY_FREQ = 22;
const AI_MOVE_LIMITER_FREQ = 8;

const AI_UPDATE_PATH_FREQ = 2;

module.exports = {
  simulate(enemy, room, gameserver, enemySimulator, terrainCollision) {
    /* eslint no-param-reassign: "off"*/
    const simulationIndex = enemy.simulations;

    enemySimulator.regenLife(enemy);

    switch (enemy.state) {
      case NO_TARGET_FOUND: {
        /* eslint no-mixed-operators: "off"*/
        if (simulationIndex % AI_TARGET_SEARCH_FREQ === 0) {
          if (enemySimulator.enemylookForTarget(enemy, room, 150)) {
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
        const arrayPosXE = Math.floor(enemy.shape.pos.x / 64);
        const arrayPosYE = Math.floor(enemy.shape.pos.y / 64);
        const arrayPosXT = Math.floor(enemy.target.shape.pos.x / 64);
        const arrayPosYT = Math.floor(enemy.target.shape.pos.y / 64);


        // Shoot at target

        if (enemy.target !== undefined) {
          enemySimulator.tryToShootProjectiles(enemy, room, gameserver);
        }
        // Move towards target, if needed
        if (simulationIndex % AI_MOVE_LIMITER_FREQ !== 0) {
          return;
        }

        const finder = new PF.AStarFinder();
        const grid = terrainCollision.getMapCloneForPF(room);

        if (!grid.isInside(arrayPosXE, arrayPosYE) || !grid.isInside(arrayPosXT, arrayPosYT)) {
          console.log('target outside map...');
          return;
        }

        let path = enemy.path;

        if (path === undefined || simulationIndex % AI_UPDATE_PATH_FREQ === 0) {
          path = finder.findPath(arrayPosXE, arrayPosYE, arrayPosXT, arrayPosYT, grid);
          enemy.path = path;
        }

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
};
