module.exports = {
  basic_projectile(damageP, cooldownP) {
    return {
      image: 'BASIC',
      path: 'STRAIGHT',
      speed: 100,
      collideToTerrain: true,
      maxTravelDistance: 200,
      damage: damageP,
      cooldown: cooldownP,
      lastShotTime: 0,
    };
  },
};
