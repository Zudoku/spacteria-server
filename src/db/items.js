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
  getItemsForCharacter(uniqueid) {
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
            resolve({ success: true, equipment: [] });
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
  saveItemsForCharacter(characterid, equipments) {

  },
  saveOneItemForCharacter(characterid, itemid) {

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
  setInventoryForCharacter(characterid, inventoryObj) {

  },
};
