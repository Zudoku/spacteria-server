const dbHandler = require('./databaseHandler.js');

module.exports = {
  listCharacters(userid) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gamecharacter WHERE userid = $1', [userid], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else {
            resolve({ success: true, characters: result.rows });
          }
        });
      });
    });
  },
  getCharacter(characterId) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
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
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        const arguments = [userid, characterObj.name, characterObj.cclass, characterObj.level, characterObj.experience];
        connection.client.query('INSERT INTO gamecharacter (userid, name, cclass, level, experience, created) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)',arguments , (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else {
            resolve({ success: true });
          }

        });
      });
    });
  },
  deleteCharacter(characterId) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('DELETE FROM gamecharacter WHERE uniqueid = $1', [characterId], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else {
            resolve({ success: true });
          }
        });
      });
    });
  },
  updateCharacter(characterObj) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('UPDATE gamecharacter SET level = $1, SET experience = $2', [characterObj.level, characterObj.experience], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else {
            resolve({ success: true });
          }
        });
      });
    });
  },
};
