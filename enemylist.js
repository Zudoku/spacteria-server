const SAT = require('sat');

module.exports = {
  dummy_small: {
    shape: new SAT.Box(new SAT.Vector(0, 0), 64, 64),
    image: '',
    type: 'dummy_small',
    stats: { health: 10000000, vitality: 0, strength: 0, dexterity: 0, defence: 10000, speed: 0 },
    collideToTerrain: false,
  },
};
