const SAT = require('sat');
const projectileList = require('./../projectilelist.js');

const E = {}; // Event handler for projectile collisions

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
      extra: {},
      stats: { health: 40, maxhealth: 40, vitality: 1, strength: 10, dexterity: 10, defence: 1, speed: 20 },
      collideToTerrain: true,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.basic_projectile(E, 50)],
      zone: undefined,
      loot: [
        {
          chance: 4,
          items: [{ id: 5, amount: 1 }],
        },
        {
          chance: 4,
          items: [{ id: 6, amount: 1 }],
        },
        {
          chance: 20,
          items: [{ id: 2, amount: 1 }],
        },
        {
          chance: 30,
          items: [{ id: 18, amount: 1 }],
        },
        {
          chance: 30,
          items: [{ id: 19, amount: 1 }],
        },
        {
          chance: 30,
          items: [{ id: 20, amount: 1 }],
        },
        {
          chance: 30,
          items: [{ id: 21, amount: 1 }],
        },
        {
          chance: 30,
          items: [{ id: 22, amount: 1 }],
        },
      ],
      exp: 100,
    };
  },
  mini_gelatinous_blob() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 12, 12),
      image: 2,
      name: 'mini gelatinous blob',
      type: 'wandering',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      extra: {},
      stats: { health: 20, maxhealth: 20, vitality: 1, strength: 10, dexterity: 10, defence: 1, speed: 20 },
      collideToTerrain: true,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.mini_blob_projectile(E, 20)],
      zone: undefined,
      loot: [
        {
          chance: 25,
          items: [{ id: 1, amount: 1 }],
        },
        {
          chance: 4,
          items: [{ id: 5, amount: 1 }],
        },
        {
          chance: 50,
          items: [{ id: 18, amount: 1 }],
        },
        {
          chance: 50,
          items: [{ id: 19, amount: 1 }],
        },
        {
          chance: 50,
          items: [{ id: 20, amount: 1 }],
        },
        {
          chance: 50,
          items: [{ id: 21, amount: 1 }],
        },
        {
          chance: 50,
          items: [{ id: 22, amount: 1 }],
        },
      ],
      exp: 20,
    };
  },
  green_mini_gelatinous_blob() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 8, 8),
      image: 4,
      name: 'green mini gelatinous blob',
      type: 'wandering',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      extra: {},
      stats: { health: 200, maxhealth: 200, vitality: 1, strength: 10, dexterity: 10, defence: 1, speed: 20 },
      collideToTerrain: true,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.mini_blob_projectile(E, 20)],
      zone: undefined,
      loot: [
        {
          chance: 1,
          items: [{ id: 3, amount: 1 }, { id: 4, amount: 1 }],
        },
        {
          chance: 1,
          items: [{ id: 7, amount: 2 }],
        },
        {
          chance: 4,
          items: [{ id: 5, amount: 1 }],
        },
        {
          chance: 4,
          items: [{ id: 5, amount: 1 }],
        },
        {
          chance: 2,
          items: [{ id: 20, amount: 1 }, { id: 18, amount: 1 }],
        },
      ],
      exp: 200,
    };
  },
  blob_guardian() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 60, 60),
      image: 5,
      name: 'Molecyloid',
      type: 'static',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      extra: {},
      stats: { health: 250, maxhealth: 250, vitality: 1, strength: 10, dexterity: 10, defence: 1, speed: 20 },
      collideToTerrain: true,
      state: 0,
      simulations: 0,
      projectiles: [
        projectileList.blob_guardian(E, 10),
        projectileList.blob_guardian_slow(E, 50),
      ],
      zone: undefined,
      loot: [
        {
          chance: 10,
          items: [{ id: 3, amount: 1 }, { id: 4, amount: 1 }, { id: 5, amount: 1 }],
        },
        {
          chance: 10,
          items: [{ id: 18, amount: 1 }, { id: 19, amount: 1 }, { id: 20, amount: 1 }],
        },
        {
          chance: 10,
          items: [{ id: 21, amount: 1 }, { id: 22, amount: 1 }],
        },
      ],
      exp: 100,
    };
  },
  charger() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 48, 48),
      image: 6,
      name: 'Charger',
      type: 'wandering',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      extra: {},
      stats: { health: 300, maxhealth: 300, vitality: 1, strength: 10, dexterity: 10, defence: 1, speed: 200 },
      collideToTerrain: true,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.charger(E, 15)],
      zone: undefined,
      loot: [
        {
          chance: 5,
          items: [{ id: 10, amount: 1 }],
        },
        {
          chance: 5,
          items: [{ id: 11, amount: 1 }],
        },
        {
          chance: 20,
          items: [{ id: 3, amount: 1 }],
        },
        {
          chance: 10,
          items: [{ id: 18, amount: 1 }, { id: 19, amount: 1 }, { id: 20, amount: 1 }],
        },
        {
          chance: 10,
          items: [{ id: 21, amount: 1 }, { id: 22, amount: 1 }],
        },
      ],
      exp: 200,
    };
  },
  slimeguardian_a() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 128, 128),
      image: 7,
      name: 'slimeguardian a',
      type: 'slimeguardian_a',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      extra: {},
      stats: { health: 4000, maxhealth: 4000, vitality: 0, strength: 10, dexterity: 10, defence: 1, speed: 200 },
      collideToTerrain: false,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.slimebrother_dance_circle(E, 40), projectileList.slimebrother_dance(E, 30)],
      zone: undefined,
      loot: [
        {
          chance: 1,
          items: [{ id: 13, amount: 1 }, { id: 15, amount: 1 }],
        },
        {
          chance: 1,
          items: [{ id: 14, amount: 1 }],
        },
        {
          chance: 4,
          items: [{ id: 12, amount: 15 }],
        },
        {
          chance: 4,
          items: [{ id: 6, amount: 5 }],
        },
        {
          chance: 3,
          items: [{ id: 18, amount: 1 }, { id: 19, amount: 1 }, { id: 20, amount: 1 }],
        },
        {
          chance: 3,
          items: [{ id: 21, amount: 1 }, { id: 22, amount: 1 }],
        },
      ],
      exp: 1000,
    };
  },
  slimeguardian_b() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 128, 128),
      image: 8,
      name: 'slimeguardian b',
      type: 'slimeguardian_b',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      extra: {},
      stats: { health: 4000, maxhealth: 4000, vitality: 0, strength: 10, dexterity: 10, defence: 1, speed: 200 },
      collideToTerrain: false,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.slimebrother_dance_slow(E, 100)],
      zone: undefined,
      loot: [
        {
          chance: 1,
          items: [{ id: 16, amount: 1 }, { id: 17, amount: 1 }],
        },
        {
          chance: 3,
          items: [{ id: 18, amount: 1 }, { id: 19, amount: 1 }, { id: 20, amount: 1 }],
        },
        {
          chance: 3,
          items: [{ id: 21, amount: 1 }, { id: 22, amount: 1 }],
        },
      ],
      exp: 1000,
    };
  },
  test_monster() {
    return {
      shape: new SAT.Box(new SAT.Vector(0, 0), 64, 64),
      image: 5,
      name: 'testingutil',
      type: 'testingutil',
      hitsound: 'BLOB',
      deathsound: 'BLOB',
      extra: {},
      stats: { health: 100000, maxhealth: 100000, vitality: 0, strength: 10, dexterity: 10, defence: 1, speed: 200 },
      collideToTerrain: false,
      state: 0,
      simulations: 0,
      projectiles: [projectileList.slimebrother_dance_slow(E, 200)],
      zone: undefined,
      loot: [
        {
          chance: 1,
          items: [{ id: 1, amount: 1 }],
        },
      ],
      exp: 20,
    };
  },
};
