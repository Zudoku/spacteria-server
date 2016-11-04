
const enemyList = require('./enemylist.js');


module.exports = {

  getMonster(monsterID, level, initX, initY) {
    const foundMonster = enemyList[monsterID];

    foundMonster.shape.pos.x = initX;
    foundMonster.shape.pos.y = initY;
    foundMonster.x = initX;
    foundMonster.y = initY;
    foundMonster.lastBroadCastedPosition = { x: initX, y: initY };
    foundMonster.hash = module.exports.guid();

    // Scale stats based on level

    return foundMonster;
  },
  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
  },
};
