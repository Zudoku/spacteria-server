
const enemyList = require('./enemylist.js');

module.exports = {

  getMonster(monsterID, level, initX, initY) {
    const foundMonster = enemyList[monsterID];

    foundMonster.shape.translate(initX, initY);

    // Scale stats based on level

    return foundMonster;
  },
};
