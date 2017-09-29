module.exports = {
  angleBetweenTwoPoints(p1, p2) {
    const dy = p1.y - p2.y;
    const dx = p1.x - p2.x;
    const vlength = Math.sqrt((dx * dx) + (dy * dy));
    const ny = dy * vlength;
    const nx = dx * vlength;
    let angle = Math.atan2(1, 0) - Math.atan2(ny, nx);
    angle *= 180 / Math.PI;
    if (angle < 0) {
      angle = 360 + angle;
    }
    return angle;
  },
  guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(10).substring(1);
    }
    return `${s4() + s4()}${s4()}${s4()}${s4()}${s4()}${s4()}${s4()}`;
  },
  getRandomIntInclusive(min, max) {
    /* eslint no-mixed-operators: "off"*/
    const minC = Math.ceil(min);
    const maxF = Math.floor(max);
    return Math.floor(Math.random() * (maxF - minC + 1)) + minC;
  },
  isString(oobj) {
    return (oobj !== undefined && typeof oobj === 'string');
  },
};
