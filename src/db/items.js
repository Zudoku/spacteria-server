const dbHandler = require('./databaseHandler.js');

module.exports = {
  getItem(uniqueid) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gameitem WHERE uniqueid = $1', [uniqueid], (err, result) => {
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else if (result.rows.length <= 0) {
            resolve({ success: false, msg: 'no such itemid' });
          } else {
            const itemdata = result.rows[0];
            connection.client.query('SELECT * FROM gameitemattribute WHERE itemid = $1', [uniqueid], (err2, resultAttributes) => {
              connection.done(err2);
              if (err2) {
                resolve({ success: false, msg: 'DB error' });
              } else {
                itemdata.attributes = resultAttributes.rows.map(x => ({ attributeid: x.attributeid, attributevalue: x.attributevalue }));
                resolve({ success: true, item: itemdata });
              }
            });
          }
        });
      });
    });
  },
  getEquipmentForCharacter(uniqueid) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gameequipment WHERE characterid = $1', [uniqueid], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else if (result.rows.length === 0) {
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
      });
    });
  },
  getInventoryForCharacter(uniqueid) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gameinventory WHERE characterid = $1', [uniqueid], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else if (result.rows.length === 0) {
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
                const originalRawData = result.rows.find(x => x.itemid === itemresult.uniqueid);
                inventoryObj[originalRawData.slot] = { data: itemresult, amount: originalRawData.quantity, uniqueid: originalRawData.itemid };
              }
              resolve({ success: true, inventory: inventoryObj });
            });
          }
        });
      });
    });
  },
  saveEquipmentForCharacter(characterid, equipmentObj) {
    // Commit based implementation maybe needed here ? depending if this causes problems...
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('DELETE FROM gameequipment WHERE characterid = $1', [characterid], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else {
            const equipmentPromises = [];
            for (let j = 1; j <= 8; j++) {
              const equipmentSlot = equipmentObj[j];
              const DESTINATION_EQUIPMENT = 2;
              if (equipmentSlot !== undefined) {
                equipmentPromises.push(module.exports.saveItemForCharacter(characterid, equipmentSlot.uniqueid, j, DESTINATION_EQUIPMENT));
              }
            }
            Promise.all(equipmentPromises).then((data) => {
              resolve({ success: true, equipment: equipmentObj });
            });
          }
        });
      });
    });
  },
  saveInventoryForCharacter(characterid, inventoryObj) {
    // Commit based implementation maybe needed here ? depending if this causes problems...
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('DELETE FROM gameinventory WHERE characterid = $1', [characterid], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else {
            const inventoryPromises = [];
            for (let j = 1; j <= 20; j++) {
              const inventorySlot = inventoryObj[j];
              const DESTINATION_INVENTORY = 1;
              if (inventorySlot !== undefined) {
                inventoryPromises.push(module.exports.saveItemForCharacter(characterid, inventorySlot.uniqueid, j, DESTINATION_INVENTORY, inventorySlot.amount));
              }
            }

            Promise.all(inventoryPromises).then((data, reject) => {
              resolve({ success: true, inventory: inventoryObj });
            });
          }
        });
      });
    });
  },
  saveItemForCharacter(characterid, itemid, index, destination, quantity) {
    // Destinations : 1 -> inventory, 2 -> equipment
    return new Promise((resolve, reject) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          reject({ success: false });
        } else if (destination === 1) {
          connection.client.query(
              'INSERT INTO gameinventory(characterid, itemid, quantity, slot) VALUES($1, $2, $3, $4)',
               [characterid, itemid, quantity, index], (err, result) => {
                 if (err) {
                   reject({ success: false, msg: 'DB error' });
                 } else {
                   resolve({ success: true });
                 }
               });
        } else if (destination === 2) {
          connection.client.query(
              'INSERT INTO gameequipment(characterid, itemid) VALUES($1, $2)',
              [characterid, itemid], (err, result) => {
                connection.done(err);
                if (err) {
                  reject({ success: false, msg: 'DB error' });
                } else {
                  resolve({ success: true });
                }
              });
        }
      });
    });
  },
};
