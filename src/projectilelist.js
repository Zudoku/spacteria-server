module.exports = {
  basic_projectile(damageP, cooldownP) {
    return {
      image: 'BASIC',
      path: 'STRAIGHT',
      speed: 50,
      collideToTerrain: true,
      maxTravelDistance: 300,
      damage: damageP,
      cooldown: cooldownP,
      lastShotTime: 0,
    };
  },
  mini_blob_projectile(damageP, cooldownP) {
    return {
      image: 'MINIBLOB',
      path: 'STRAIGHT',
      speed: 70,
      collideToTerrain: true,
      maxTravelDistance: 100,
      damage: damageP,
      cooldown: cooldownP,
      lastShotTime: 0,
    };
  },
};
