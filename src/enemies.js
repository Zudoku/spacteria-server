
const enemyList = require('./enemylist.js');
const SF = require('./staticFuncs.js');


module.exports = {

  getMonster(monsterID, level, initX, initY) {
    const foundMonster = enemyList[monsterID];

    foundMonster.shape.pos.x = initX;
    foundMonster.shape.pos.y = initY;
    foundMonster.x = initX;
    foundMonster.y = initY;
    foundMonster.lastBroadCastedPosition = { x: initX, y: initY };
    foundMonster.hash = SF.guid();

    // Scale stats based on level

    return foundMonster;
  },
};
