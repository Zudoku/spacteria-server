const SAT = require('sat');

module.exports = {
  dummy_small: {
    shape: new SAT.Box(new SAT.Vector(0, 0), 64, 64),
    image: '',
    type: 'dummy',
    stats: { health: 10000000, vitality: 0, strength: 0, dexterity: 0, defence: 10000, speed: 0 },
    collideToTerrain: false,
    state: 0,
    simulations: 0,
  },
  small_guy: {
    shape: new SAT.Box(new SAT.Vector(0, 0), 32, 32),
    image: '',
    type: 'wandering',
    stats: { health: 1000, vitality: 0, strength: 0, dexterity: 0, defence: 1, speed: 50 },
    collideToTerrain: true,
    state: 0,
    simulations: 0,
  },
};
