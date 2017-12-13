const SF = require('./../staticFuncs.js');


const AI_TARGET_SEARCH_FREQ = 10;
const AI_MOVE_RANDOMLY_FREQ = 5;
const AI_LOSE_INTEREST_FREQ = 125;

module.exports = {
  simulate(enemy, room, gameserver, enemySimulator) {
    /* eslint no-param-reassign: "off"*/
    const simulationIndex = enemy.simulations;

    enemySimulator.regenLife(enemy);

    if (simulationIndex % AI_LOSE_INTEREST_FREQ === 0) {
      enemy.target = undefined;
    }

    if (simulationIndex % AI_TARGET_SEARCH_FREQ === 0) {
      enemySimulator.enemylookForTarget(enemy, room, 500);
    }
    if (enemy.target !== undefined) {
      enemySimulator.tryToShootProjectiles(enemy, room, gameserver);
    }

    /* eslint no-mixed-operators: "off"*/
    if (simulationIndex % AI_MOVE_RANDOMLY_FREQ !== 0) {
      return;
    }

    // Move somewhere
    let newTargetX = enemy.shape.pos.x;
    let newTargetY = enemy.shape.pos.y;

    if (SF.getRandomIntInclusive(0, 1) === 0) {
      newTargetX += (SF.getRandomIntInclusive(0, 6) - 2);
    } else {
      newTargetY += (SF.getRandomIntInclusive(0, 6) - 2);
    }

    enemy.moveTarget = { x: newTargetX, y: newTargetY };
  },
};
