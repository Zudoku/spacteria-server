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

};
