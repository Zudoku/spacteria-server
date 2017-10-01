const SAT = require('sat');
const projectileList = require('./../projectilelist.js');

module.exports = {
  dummy_small() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 64, 64),
      image: 0,
      type: 'dummy',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      stats: { health: 10000000, maxhealth: 10000000, vitality: 0, strength: 0, dexterity: 0, defence: 10000, speed: 0 },
      collideToTerrain: false,
      state: 0,
      simulations: 0,
      projectiles: [],
      zone: undefined,
    };
  },
  gelatinous_blob() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 32, 32),
      image: 1,
      name: 'red gelatinous blob',
      type: 'wandering',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      stats: { health: 500, maxhealth: 500, vitality: 1, strength: 10, dexterity: 10, defence: 1, speed: 20 },
      collideToTerrain: true,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.basic_projectile(50, 1000)],
      zone: undefined,
      loot: [
        {
          chance: 1,
          items: [{ id: 1, amount: 1 }, { id: 2, amount: 1 }, { id: 3, amount: 1 }],
        },
      ],
      exp: 100,
    };
  },
  mini_gelatinous_blob() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 8, 8),
      image: 2,
      name: 'mini gelatinous blob',
      type: 'wandering',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      stats: { health: 200, maxhealth: 200, vitality: 1, strength: 10, dexterity: 10, defence: 1, speed: 20 },
      collideToTerrain: true,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.mini_blob_projectile(20, 500)],
      zone: undefined,
      loot: [
        {
          chance: 1,
          items: [{ id: 1, amount: 1 }, { id: 2, amount: 1 }, { id: 3, amount: 1 }],
        },
      ],
      exp: 20,
    };
  },
  green_mini_gelatinous_blob() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 8, 8),
      image: 2,
      name: 'green mini gelatinous blob',
      type: 'wandering',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      stats: { health: 1000, maxhealth: 1000, vitality: 1, strength: 10, dexterity: 10, defence: 1, speed: 20 },
      collideToTerrain: true,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.mini_blob_projectile(20, 500)],
      zone: undefined,
      loot: [
        {
          chance: 1,
          items: [{ id: 1, amount: 1 }, { id: 2, amount: 1 }, { id: 3, amount: 1 }],
        },
      ],
      exp: 20,
    };
  },
};
