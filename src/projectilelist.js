module.exports = {
  basic_projectile(E, damageP) {
    return {
      image: 'BASIC',
      path: 'STRAIGHT',
      speed: 50,
      collideToTerrain: true,
      maxTravelDistance: 300,
      damage: damageP,
      cooldown: 1000,
      lastShotTime: 0,
      width: 2,
      height: 2,
    };
  },
  mini_blob_projectile(E, damageP) {
    return {
      image: 'MINIBLOB',
      path: 'STRAIGHT',
      speed: 70,
      collideToTerrain: true,
      maxTravelDistance: 100,
      damage: damageP,
      cooldown: 500,
      lastShotTime: 0,
      width: 2,
      height: 2,
    };
  },
  blob_guardian(E, damageP) {
    return {
      image: 'BLOBGUARDIAN',
      path: 'STRAIGHT',
      speed: 200,
      collideToTerrain: true,
      maxTravelDistance: 100,
      damage: damageP,
      cooldown: 300,
      lastShotTime: 0,
      width: 2,
      height: 2,
    };
  },
  blob_guardian_slow(E, damageP) {
    return {
      image: 'BLOBGUARDIANSLOW',
      path: 'STRAIGHT',
      speed: 50,
      collideToTerrain: false,
      maxTravelDistance: 700,
      damage: damageP,
      cooldown: 1000,
      lastShotTime: 0,
      width: 2,
      height: 2,
    };
  },
  charger(E, damageP) {
    return {
      image: 'CHARGER',
      path: 'STRAIGHT',
      speed: 200,
      collideToTerrain: true,
      maxTravelDistance: 100,
      damage: damageP,
      cooldown: 140,
      lastShotTime: 0,
      width: 2,
      height: 2,
    };
  },
  slimebrother_dance_circle(E, damageP) {
    return {
      image: 'BLOBGUARDIAN',
      path: 'STRAIGHT',
      speed: 50,
      collideToTerrain: false,
      maxTravelDistance: 600,
      damage: damageP,
      cooldown: 1,
      lastShotTime: 0,
      width: 16,
      height: 16,
    };
  },
  slimebrother_dance(E, damageP) {
    return {
      image: 'BLOBGUARDIANSLOW',
      path: 'STRAIGHT',
      speed: 40,
      collideToTerrain: false,
      maxTravelDistance: 600,
      damage: damageP,
      cooldown: 1,
      lastShotTime: 0,
      width: 16,
      height: 16,
    };
  },
  slimebrother_dance_slow(E, damageP) {
    return {
      image: 'SLIMEGUARDIANSLOW',
      path: 'STRAIGHT',
      speed: 20,
      collideToTerrain: false,
      maxTravelDistance: 600,
      damage: damageP,
      cooldown: 1,
      lastShotTime: 0,
      width: 27,
      height: 27,
    };
  },
};
