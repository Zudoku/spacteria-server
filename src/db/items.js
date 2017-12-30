const dbHandler = require('./databaseHandler.js');
const { exec } = require('child_process');
const fs = require('fs');

module.exports = {
  getItem(uniqueid) {
    return dbHandler.simpleQuery('SELECT * FROM gameitem WHERE uniqueid = $1', [uniqueid], false, (result, resolve) => {
      if (result.rows.length <= 0) {
        resolve({ success: false, msg: 'no such itemid' });
      } else {
        const itemdata = result.rows[0];
        itemdata.attributes = itemdata.stats.map(x => ({ attributeid: x.id, attributevalue: x.value }));
        delete itemdata.stats;
        resolve({ success: true, item: itemdata });
      }
    });
  },
  getEquipmentForCharacter(uniqueid) {
    return dbHandler.simpleQuery('SELECT * FROM gameequipment WHERE characterid = $1', [uniqueid], false, (result, resolve) => {
      if (result.rows.length === 0) {
        resolve({ success: true, equipment: {} });
      } else {
        const equipmentPromises = [];
        for (let j = 0; j < result.rows.length; j++) {
          const equipmentSlot = result.rows[j];
          equipmentPromises.push(module.exports.getItem(equipmentSlot.itemid));
        }
        Promise.all(equipmentPromises).then((data) => {
          const equipments = {};
          for (let index = 0; index < data.length; index++) {
            const resultL = data[index];
            equipments[resultL.item.itemtypeid] = resultL.item;
          }
          resolve({ success: true, equipment: equipments });
        });
      }
    });
  },
  getInventoryForCharacter(uniqueid) {
    return dbHandler.simpleQuery('SELECT * FROM gameinventory WHERE characterid = $1', [uniqueid], false, (result, resolve) => {
      if (result.rows.length === 0) {
        resolve({ success: true, inventory: {} });
      } else {
        const inventoryPromises = [];
        for (let j = 0; j < result.rows.length; j++) {
          const inventorySlot = result.rows[j];
          inventoryPromises.push(module.exports.getItem(inventorySlot.itemid));
        }

        Promise.all(inventoryPromises).then((data) => {
          const inventoryObj = {};
          for (let index = 0; index < data.length; index++) {
            const itemresult = data[index].item;
            if (itemresult === undefined) {
              console.log('[WARNING]: Character has illegal item. Maybe you forgot to import items?');
            } else {
              const originalRawData = result.rows.find(x => x.itemid === itemresult.uniqueid);
              inventoryObj[originalRawData.slot] = { data: itemresult, amount: originalRawData.quantity, uniqueid: originalRawData.itemid };
            }
          }
          resolve({ success: true, inventory: inventoryObj });
        });
      }
    });
  },
  saveEquipmentForCharacter(characterid, equipmentObj) {
    // Commit based implementation maybe needed here ? depending if this causes problems...
    return dbHandler.simpleQuery('DELETE FROM gameequipment WHERE characterid = $1', [characterid], false, (result, resolve) => {
      const equipmentPromises = [];
      for (let j = 0; j < 8; j++) {
        const equipmentSlot = equipmentObj[j];
        const DESTINATION_EQUIPMENT = 2;
        if (equipmentSlot !== undefined) {
          equipmentPromises.push(module.exports.saveItemForCharacter(characterid, equipmentSlot.uniqueid, j, DESTINATION_EQUIPMENT));
        }
      }
      Promise.all(equipmentPromises).then(() => {
        resolve({ success: true, equipment: equipmentObj });
      });
    });
  },
  saveInventoryForCharacter(characterid, inventoryObj) {
    // Commit based implementation maybe needed here ? depending if this causes problems...
    return dbHandler.simpleQuery('DELETE FROM gameinventory WHERE characterid = $1', [characterid], false, (result, resolve) => {
      const inventoryPromises = [];
      for (let j = 1; j <= 20; j++) {
        const inventorySlot = inventoryObj[j];
        const DESTINATION_INVENTORY = 1;
        if (inventorySlot !== undefined) {
          inventoryPromises.push(
            module.exports.saveItemForCharacter(characterid, inventorySlot.uniqueid, j, DESTINATION_INVENTORY, inventorySlot.amount)
          );
        }
      }

      Promise.all(inventoryPromises).then(() => {
        resolve({ success: true, inventory: inventoryObj });
      });
    });
  },
  saveItemForCharacter(characterid, itemid, index, destination, quantity) {
    // Destinations : 1 -> inventory, 2 -> equipment
    const DESTINATION_INVENTORY = 1;
    const DESTINATION_EQUIPMENT = 2;
    if (destination === DESTINATION_INVENTORY) {
      return dbHandler.simpleQuery('INSERT INTO gameinventory(characterid, itemid, quantity, slot) VALUES($1, $2, $3, $4)',
      [characterid, itemid, quantity, index], false, (result, resolve) => {
        resolve({ success: true });
      });
    } else if (destination === DESTINATION_EQUIPMENT) {
      return dbHandler.simpleQuery('INSERT INTO gameequipment(characterid, itemid) VALUES($1, $2)',
      [characterid, itemid], false, (result, resolve) => {
        resolve({ success: true });
      });
    }
    return new Promise(resolve => resolve({ success: false }));
  },
  saveItemsToDatabase(payload) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        const shouldAbort = (err) => {
          if (err) {
            connection.client.query('ROLLBACK', () => {
              connection.done(err);
              resolve({ msg: `ERROR ${err}` });
            });
          }
          return !!err;
        };
        module.exports.getLastItemIndex(connection.client).then((data) => {
          connection.client.query('BEGIN', (err) => {
            if (shouldAbort(err)) return;
            const itemPromises = [];
            for (const itemSaved of payload) {
              itemPromises.push(module.exports.saveItemToDatabase(itemSaved, connection.client, itemSaved.uniqueid <= data && data !== 1));
            }
            Promise.all(itemPromises).then(() => {
              connection.client.query('COMMIT', (err2) => {
                connection.done();
                if (err2) {
                  resolve({ msg: 'ERROR' });
                } else {
                  resolve({ msg: 'Success' });
                  module.exports.makeItemDatabaseDump();
                }
              });
            }).catch((reason) => {
              if (shouldAbort(reason)) return;
            });
          });
        });
      });
    });
  },
  saveItemToDatabase(item, client, updateInsteadOfInsert) {
    return new Promise((resolve, reject) => {
      if (updateInsteadOfInsert) {
        client.query('UPDATE gameitem SET displayname=$1, description=$2, itemtypeid=$3, stackable=$4, levelreq=$5, tradeable=$6, rarity=$7, sellvalue=$8, imageid=$9, stats=$10 WHERE uniqueid=$11',
        [item.displayname, item.description, item.itemtypeid, item.stackable, item.levelreq, item.tradeable, item.rarity, item.sellvalue, item.imageid, item.stats, item.uniqueid], (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        client.query('INSERT INTO gameitem (displayname, description, itemtypeid, stackable, levelreq, tradeable, rarity, sellvalue, imageid, stats) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [item.displayname, item.description, item.itemtypeid, item.stackable, item.levelreq, item.tradeable, item.rarity, item.sellvalue, item.imageid, item.stats], (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  },
  getLastItemIndex(client) {
    return new Promise((resolve) => {
      client.query('SELECT last_value FROM gameitem_uniqueid_seq', (err, res) => {
        resolve(res.rows[0].last_value);
      });
    });
  },
  getAllItems() {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        connection.client.query('SELECT * FROM gameitem ORDER BY uniqueid ASC', (err, res) => {
          connection.done(err);
          resolve(res.rows);
        });
      });
    });
  },
  makeItemDatabaseDump() {
    const pc = dbHandler.getConfig();
    exec(`pg_dump --dbname=postgresql://${pc.user}:${pc.password}@localhost:${pc.port}/spacteriagame -t gameitem`, (err, stdout) => {
      fs.writeFile(`${__dirname}/../../sqlscripts/dump/items.sql`, `${stdout}`, () => {});
    });
  },
};
