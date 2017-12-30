const dbHandler = require('./databaseHandler.js');

module.exports = {
  saveCurrencies(currencyObj, characterid) {
    return dbHandler.simpleQuery('UPDATE gamecharactercurrency SET coin = $1, bugbounty = $2, rollticket = $3 WHERE characterid = $4',
    [currencyObj.coin, currencyObj.bugbounty, currencyObj.rollticket, characterid], false, (result, resolve) => {
      resolve({ success: true });
    });
  },
  getCurrencies(characterid) {
    return dbHandler.simpleQuery('SELECT * FROM gamecharactercurrency WHERE characterid = $1', [characterid], false, (result, resolve) => {
      if (result.rows.length === 0) {
        resolve({ success: true, currencies: {} });
      } else {
        resolve({ success: true, currencies: result.rows[0] });
      }
    });
  },

};
