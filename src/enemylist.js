const SAT = require('sat');
const projectileList = require('./projectilelist.js');

module.exports = {
  dummy_small() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 64, 64),
      image: 0,
      type: 'dummy',
      stats: { health: 10000000, vitality: 0, strength: 0, dexterity: 0, defence: 10000, speed: 0 },
      collideToTerrain: false,
      state: 0,
      simulations: 0,
      projectiles: [],
      zone: undefined,
    };
  },
  small_guy() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 32, 32),
      image: 1,
      type: 'wandering',
      stats: { health: 30, vitality: 0, strength: 10, dexterity: 10, defence: 1, speed: 50 },
      collideToTerrain: true,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.basic_projectile(2, 1000)],
      zone: undefined,
      loot: [
        {
          chance: 1,
          items: [{ id: -1, amount: 200 }],
        },
        {
          chance: 1,
          items: [{ id: 1, amount: 1 }, { id: 2, amount: 1 }, { id: 3, amount: 1 }],
        },
      ],
      exp: 100,
    };
  },
};
