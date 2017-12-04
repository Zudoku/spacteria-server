module.exports = {
  1: { // Spawn area
    portals: [{ id: 2, prob: 1.0, x: 2 * 64, y: 18 * 64 }, { id: 6, prob: 1.0, x: 3 * 64, y: 18 * 64 }],
    npcs: [
      {
        type: 'VENDOR',
        name: 'Worm the vendor',
        lines: {
          interact: [
            'Elly belly, alien jelly! Coins for trade.',
            'Have you heard of the latest news about the purification?',
            'Did you hear about what happened to the other capsules?',
            'I heard we were on the news!',
            'Can you get me some alien jelly? I need it .. for something',
            'You have some trash for me again?',
          ],
          random: [],
        },
        prob: 1.0,
        x: 8 * 64,
        y: 1.5 * 64,
        image: 10,
        width: 64,
        height: 64,
      },
      {
        type: 'IDLE',
        name: 'Han',
        lines: {
          interact: [
            'Moo.',
            'Meow.',
            'Woof.',
            'Bark.',
            'Hoo hoo.',
            'Oink.',
            'Gobble gobble.',
          ],
          random: [],
        },
        prob: 1.0,
        x: 12 * 64,
        y: 1.5 * 64,
        image: 21,
        width: 64,
        height: 64,
      },
    ],
    enemies: [{ id: 'gelatinous_blob', amount: 1, prob: 1.0, x: 100, y: 100 }],
    lootbags: [],
    generationData: undefined,
    filename: 'temp',
    width: 20,
    height: 20,
  },
  2: { // first street
    portals: [{ id: 1, prob: 1.0, x: 3 * 64, y: 3 * 64 }, { id: 2, prob: 1.0 }, { id: 3, prob: 0.5 }],
    npcs: [],
    enemies: [{ id: 'gelatinous_blob', amount: 2, prob: 1.0 }, { id: 'mini_gelatinous_blob', amount: 8, prob: 0.4 }],
    lootbags: [],
    generationData: {
      minroomheight: 2,
      maxroomheight: 6,
      minroomwidth: 2,
      maxroomwidth: 6,
      minroomamount: 10,
      maxroomamount: 20,
      minroomdistance: 3,
      maxroomdistance: 20,
      width: 60,
      height: 60,
      tiles: {
        floor: [5],
        wall: [8],
        path: [3],
        empty: [4, 10],
      },
    },
    width: 60,
    height: 60,
  },
  3: { // 1DL1
    portals: [{ id: 2, prob: 1.0, x: 3 * 64, y: 3 * 64 }, { id: 4, prob: 1.0 }],
    npcs: [],
    enemies: [
      { id: 'gelatinous_blob', amount: 1, prob: 1.0 },
      { id: 'mini_gelatinous_blob', amount: 1, prob: 0.5 },
      { id: 'green_mini_gelatinous_blob', amount: 1, prob: 0.02 },
      { id: 'charger', amount: 2, prob: 0.1 },
      { id: 'blob_guardian', amount: 1, prob: 0.25 },
    ],
    lootbags: [],
    generationData: {
      minroomheight: 3,
      maxroomheight: 4,
      minroomwidth: 3,
      maxroomwidth: 4,
      minroomamount: 10,
      maxroomamount: 20,
      minroomdistance: 6,
      maxroomdistance: 10,
      width: 40,
      height: 40,
      tiles: {
        floor: [14, 5],
        wall: [18],
        path: [3],
        empty: [11, 15, 10],
      },
    },
    width: 40,
    height: 40,
  },
  4: { // 1DL2
    portals: [{ id: 3, prob: 1.0, x: 3 * 64, y: 3 * 64 }, { id: 5, prob: 1.0 }],
    npcs: [],
    enemies: [
      { id: 'gelatinous_blob', amount: 3, prob: 1.0 },
      { id: 'mini_gelatinous_blob', amount: 3, prob: 0.5 },
      { id: 'green_mini_gelatinous_blob', amount: 1, prob: 0.05 },
      { id: 'charger', amount: 2, prob: 0.1 },
      { id: 'blob_guardian', amount: 2, prob: 0.35 },
    ],
    lootbags: [],
    generationData: {
      minroomheight: 3,
      maxroomheight: 8,
      minroomwidth: 3,
      maxroomwidth: 8,
      minroomamount: 5,
      maxroomamount: 10,
      minroomdistance: 8,
      maxroomdistance: 20,
      width: 60,
      height: 60,
      tiles: {
        floor: [14, 5],
        wall: [18],
        path: [3],
        empty: [3, 15, 16],
      },
    },
    width: 60,
    height: 60,
  },
  5: { // 1DL3
    portals: [{ id: 4, prob: 1.0, x: 3 * 64, y: 3 * 64 }, { id: 6, prob: 1.0 }],
    npcs: [],
    enemies: [
      { id: 'gelatinous_blob', amount: 1, prob: 0.1 },
      { id: 'green_mini_gelatinous_blob', amount: 1, prob: 0.1 },
      { id: 'charger', amount: 1, prob: 0.75 },
      { id: 'charger', amount: 1, prob: 0.75 },
      { id: 'blob_guardian', amount: 2, prob: 0.65 },
    ],
    lootbags: [],
    generationData: {
      minroomheight: 3,
      maxroomheight: 8,
      minroomwidth: 3,
      maxroomwidth: 8,
      minroomamount: 10,
      maxroomamount: 20,
      minroomdistance: 2,
      maxroomdistance: 20,
      width: 80,
      height: 80,
      tiles: {
        floor: [14, 5],
        wall: [4],
        path: [17],
        empty: [16, 17, 18],
      },
    },
    width: 80,
    height: 80,
  },
  6: { // 1DL4 (MINIBOSS)
    portals: [],
    spawn: { x: 46 * 64, y: 188 * 64 },
    npcs: [],
    enemies: [
       { id: 'slimeguardian_a', amount: 1, prob: 1, x: 54 * 64, y: 84 * 64 },
       { id: 'slimeguardian_b', amount: 1, prob: 1, x: 58 * 64, y: 84 * 64 },
    ],
    lootbags: [],
    generationData: undefined,
    filename: '1dl4',
    width: 100,
    height: 200,
  },
  7: { // 1DL5 (BOSS)
    portals: [{ id: 2, prob: 1.0, x: 3 * 64, y: 3 * 64 }],
    npcs: [],
    enemies: [{ id: 'charger', amount: 2, prob: 1.0 }],
    lootbags: [],
    generationData: undefined,
    filename: 'temp',
    width: 40,
    height: 40,
  },
};
