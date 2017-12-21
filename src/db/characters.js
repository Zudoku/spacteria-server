const dbHandler = require('./databaseHandler.js');

module.exports = {
  listCharacters(userid) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done();
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
          connection.done();
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
  getTopTen(){
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gamecharacter ORDER BY level DESC, experience DESC LIMIT 10;', [], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else {
            resolve({ success: true, chars: result.rows });
          }
        });
      });
    });
  },
  addCharacter(characterName, userid) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done();
          resolve({ success: false });
        }
        const arguments = [userid, characterName, 1, 0];
        connection.client.query('INSERT INTO gamecharacter (userid, name, level, experience, created) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING uniqueid', arguments , (err, result) => {
          Promise.all([
            connection.client.query('INSERT INTO gamecharactercurrency (characterid, coin, bugbounty, rollticket) VALUES ($1, $2, $3, $4)', [result.rows[0].uniqueid, 0, 0, 0]),
          ]).then( (data) => {
            connection.done();
          }).catch( (error) => {
            connection.done(error);
          });
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
          connection.done();
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
          connection.done();
          resolve({ success: false });
        }
        connection.client.query('UPDATE gamecharacter SET level = $1, experience = $2 WHERE uniqueid = $3', [characterObj.level, characterObj.experience, characterObj.uniqueid], (err, result) => {
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
