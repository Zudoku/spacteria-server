const dbHandler = require('./databaseHandler.js');

module.exports = {
  saveCurrencies(currencyObj, characterid) {
    return new Promise((resolve, reject) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query(
            'UPDATE gamecharactercurrency SET coin = $1, bugbounty = $2, rollticket = $3 WHERE characterid = $4',
             [currencyObj.coin, currencyObj.bugbounty, currencyObj.rollticket, characterid], (err, result) => {
               if (err) {
                 reject({ success: false, msg: 'DB error' });
               } else {
                 resolve({ success: true });
               }
             });
      });
    });
  },
  getCurrencies(characterid) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gamecharactercurrency WHERE characterid = $1', [characterid], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else if (result.rows.length === 0) {
            resolve({ success: true, currencies: {} });
          } else {
            resolve({ success: true, currencies: result[0] });
          }
        });
      });
    });
  },

};
