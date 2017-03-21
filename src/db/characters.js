const dbHandler = require('./databaseHandler.js');

module.exports = {
  listCharacters(userid) {
    return new Promise((resolve) => {
      dbHandler.then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gamecharacter WHERE userid = $1', [userid], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          }else {
            resolve({ success: true, characters: result.rows });
          }
        });
      });
    });
  },
  getCharacter(characterId) {
    return new Promise((resolve) => {
      dbHandler.then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gamecharacter WHERE uniqueid = $1', [characterId], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          }
          if (result.rows.length <= 0) {
            resolve({ success: false, msg: 'no such characterid' });
          } else {
            const gamecharacter = result.rows[0];
            resolve({ success: true, character: gamecharacter });
          }
        });
      });
    });
  },
  addCharacter(characterObj, userid) {

  },
  deleteCharacter(characterId) {

  },
  updateCharacter(characterObj) {

  },
};
