
const enemyList = require('./enemylist.js');

module.exports = {

  getMonster(monsterID, level, initX, initY) {
    const foundMonster = enemyList[monsterID];

    foundMonster.shape.pos.x = initX;
    foundMonster.shape.pos.y = initY;

    // Scale stats based on level

    return foundMonster;
  },
};
