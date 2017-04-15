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
            connection.client.query('SELECT * FROM gameitemattribute WHERE itemid = $1', [uniqueid], (err, resultAttributes) => {
              connection.done(err);
              if (err) {
                resolve({ success: false, msg: 'DB error' });
              } else {
                itemdata.attributes = resultAttributes.rows.map((x) => {
                  return { attributeid: x.attributeid, attributevalue: x.attributevalue };
                });
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
          } else if(result.rows.length === 0){
            resolve({ success: true, equipment: [] });
          } else {
            let equipmentPromises = [];
            for(let j = 0; j < result.rows.length; j++){
              const equipmentSlot = result.rows[j];
              equipmentPromises.push(module.expors.getItem(equipmentSlot.itemid));
            }

            Promise.all(equipmentPromises).then((data) => {
              let equipments = [];
              for (let index = 0; index < data.length; index++) {
                const result = data[index];
                equipments[result.itemtypeid] = result;
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

  },
  setInventoryForCharacter(characterid, inventoryObj) {

  },
};
