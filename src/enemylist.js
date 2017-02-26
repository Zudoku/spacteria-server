const SAT = require('sat');
const projectileList = require('./projectilelist.js');

module.exports = {
  dummy_small: {
    shape: new SAT.Box(new SAT.Vector(0, 0), 64, 64),
    image: '',
    type: 'dummy',
    stats: { health: 10000000, vitality: 0, strength: 0, dexterity: 0, defence: 10000, speed: 0 },
    collideToTerrain: false,
    state: 0,
    simulations: 0,
    projectiles: [],
  },
  small_guy: {
    shape: new SAT.Box(new SAT.Vector(0, 0), 32, 32),
    image: '',
    type: 'wandering',
    stats: { health: 1000, vitality: 0, strength: 10, dexterity: 10, defence: 1, speed: 50 },
    collideToTerrain: true,
    state: 0,
    simulations: 0,
    projectiles: [projectileList.basic_projectile(2, 1000)],
  },
};
