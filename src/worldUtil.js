const gameplayconfig = require('./../config/gameplayconfig.js');
const itemDB = require('./db/items.js');

module.exports = {
  getZones(w, h) {
    const zones = {
      w,
      h,
    };

    for (let x = 0; x < gameplayconfig.zone_amount; x++) {
      zones[x] = new Array(gameplayconfig.zone_amount);
      for (let y = 0; y < gameplayconfig.zone_amount; y++) {
        zones[x][y] = { x, y, enemies: {} };
      }
    }

    return zones;
  },
  getZoneForCoord(zone, x, y) {
    if (x < 0 || y < 0 || x >= zone.w * 64 || y >= zone.h * 64) {
      return zone[0][0];
    }

    const bufferX = ((zone.w * 64) / gameplayconfig.zone_amount);
    const bufferY = ((zone.h * 64) / gameplayconfig.zone_amount);
    const zoneX = parseInt(Math.floor(x / bufferX), 10);
    const zoneY = parseInt(Math.floor(y / bufferY), 10);
    return zone[zoneX][zoneY];
  },
  calculateStatsForCharacter(playerData, currentHealth) {
    const statMapping = {
      1: 'maxhealth',
      2: 'vitality',
      3: 'strength',
      4: 'dexterity',
      5: 'defence',
      6: 'speed',
    };
    const baseStats = [
      {
        health: 5,
        dexterity: 2,
        strength: 12,
        vitality: 5,
        defence: 5,
        speed: 1,
      },
      {
        health: 3,
        dexterity: 4,
        strength: 7,
        vitality: 5,
        defence: 2,
        speed: 1,
      },
      {
        health: 6,
        dexterity: 1,
        strength: 10,
        vitality: 5,
        defence: 7,
        speed: 1,
      },
    ];
    const result = {
      health: (100 + (playerData.level * baseStats[playerData.cclass].health)),
      dexterity: (100 + (playerData.level * baseStats[playerData.cclass].dexterity)),
      strength: (100 + (playerData.level * baseStats[playerData.cclass].strength)),
      vitality: (100 + (playerData.level * baseStats[playerData.cclass].vitality)),
      defence: (100 + (playerData.level * baseStats[playerData.cclass].defence)),
      speed: (100 + (playerData.level * baseStats[playerData.cclass].speed)),
      maxhealth: (100 + (playerData.level * baseStats[playerData.cclass].health)),
    };
    // Go through items and add all stats
    for (let i = 1; i <= 8; i++) {
      const equippeditem = playerData.equipment.data[i];
      if (equippeditem !== undefined) {
        for (let e = 0; e < equippeditem.attributes.length; e++) {
          const attribute = equippeditem.attributes[e];
          const attributetypeDecoded = statMapping[attribute.attributeid];
          if (attributetypeDecoded !== undefined) {
            result[attributetypeDecoded] += attribute.attributevalue;
          }
        }
      }
    }

    if (currentHealth !== undefined) {
      result.health = currentHealth;
    } else {
      result.health = result.maxhealth;
    }
    return result;
  },
  tryToSaveItemData(player, saveEquipment, saveInventory) {
    if (gameplayconfig.data_percistence) {
      if (saveEquipment) {
        itemDB.saveEquipmentForCharacter(player.characterdata.uniqueid, player.characterdata.equipment.data).then(
          (result) => {
            if (!result.success) {
              console.log(`Error while saving equipment: ${result.msg}`);
            }
          }
        );
      }

      if (saveInventory) {
        itemDB.saveInventoryForCharacter(player.characterdata.uniqueid, player.characterdata.inventory.data).then(
          (result) => {
            if (!result.success) {
              console.log(`Error while saving inventory: ${result.msg}`);
            }
          }
        );
      }
    }
  },
};
