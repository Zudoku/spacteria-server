const gameplayconfig = require('./../config/gameplayconfig.js');
const itemDB = require('./db/items.js');
const currencyDB = require('./db/currencies.js');

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
    const baseStats = {
      health: 5,
      dexterity: 2,
      strength: 2,
      vitality: 1,
      defence: 1,
      speed: 1,
    };
    const result = {
      health: (100 + (playerData.level * baseStats.health)),
      dexterity: (1 + (playerData.level * baseStats.dexterity)),
      strength: (1 + (playerData.level * baseStats.strength)),
      vitality: (1 + (playerData.level * baseStats.vitality)),
      defence: (1 + (playerData.level * baseStats.defence)),
      speed: (100 + (playerData.level * baseStats.speed)),
      maxhealth: (100 + (playerData.level * baseStats.health)),
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
  tryToSaveItemData(player, saveEquipment, saveInventory, saveCurrency) {
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
      if (saveCurrency) {
        currencyDB.saveCurrencies(player.characterdata.currencies, player.characterdata.uniqueid).then(
          (result) => {
            if (!result.success) {
              console.log(`Error while saving currencies: ${result.msg}`);
            }
          }
        );
      }
    }
  },
};
