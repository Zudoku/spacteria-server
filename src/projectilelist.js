module.exports = {
  basic_projectile(dexterity) {
    return { image: '', path: '', speed: 100, collideToTerrain: true, maxTravelDistance: 200, damage: dexterity };
  }
};
