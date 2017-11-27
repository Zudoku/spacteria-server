const SF = require('./staticFuncs.js');

module.exports = {
  getPortal(toID, x, y) {
    const guid = SF.guid();
    const portal = {
      type: 2,
      portal: {
        to: toID,
        x,
        y,
        hash: guid,
      },
      x,
      y,
      hash: guid,
    };
    return portal;
  },
  getLootBag(lootQuality, lootContents, x, y) {
    const lootBag = {
      type: 1,
      lootbag: {
        quality: lootQuality,
        items: lootContents,
        x,
        y,
      },
      x,
      y,
      hash: SF.guid(),
    };
    return lootBag;
  },
  getNPC(image, type, name, lines, x, y, w, h) {
    const guid = SF.guid();
    const npc = {
      type: 3,
      npc: {
        image,
        type,
        name,
        lines,
        x,
        y,
        width: w,
        height: h,
      },
      x,
      y,
      hash: guid,
    };
    return npc;
  },
};
