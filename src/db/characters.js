const dbHandler = require('./databaseHandler.js');

module.exports = {
  listCharacters(userid) {
    return dbHandler.simpleQuery('SELECT * FROM gamecharacter WHERE userid = $1', [userid], false, (result, resolve) => {
      resolve({ success: true, characters: result.rows });
    });
  },
  getCharacter(characterId) {
    return dbHandler.simpleQuery('SELECT * FROM gamecharacter WHERE uniqueid = $1', [characterId], false, (result, resolve) => {
      if (result.rows.length <= 0) {
        resolve({ success: false, msg: 'no such characterid' });
      } else {
        const gamecharacter = result.rows[0];
        resolve({ success: true, character: gamecharacter });
      }
    });
  },
  getTopTen() {
    return dbHandler.simpleQuery('SELECT * FROM gamecharacter ORDER BY level DESC, experience DESC LIMIT 10;', [], false, (result, resolve) => {
      resolve({ success: true, chars: result.rows });
    });
  },
  addCharacter(characterName, userid) {
    return dbHandler.simpleQuery(
      'INSERT INTO gamecharacter (userid, name, level, experience, created) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING uniqueid',
      [userid, characterName, 1, 0], true, (result, resolve, connection) => {
        const createdCharacterId = result.rows[0].uniqueid;
        Promise.all([
          connection.client.query('INSERT INTO gamecharactercurrency (characterid, coin, bugbounty, rollticket) VALUES ($1, $2, $3, $4)',
        [createdCharacterId, 0, 0, 0]),
          connection.client.query('INSERT INTO gameinventory (characterid, itemid, quantity, slot) VALUES ($1, 1, 1, 1)', [createdCharacterId]),
        ]).then(() => {
          connection.done();
          resolve({ success: true });
        }).catch((error) => {
          connection.done(error);
          resolve({ success: false, msg: 'DB error' });
        });
      });
  },
  deleteCharacter(characterId) {
    return dbHandler.simpleQuery('DELETE FROM gamecharacter WHERE uniqueid = $1', [characterId], false, (result, resolve) => {
      resolve({ success: true });
    });
  },
  updateCharacter(characterObj) {
    return dbHandler.simpleQuery('UPDATE gamecharacter SET level = $1, experience = $2 WHERE uniqueid = $3',
    [characterObj.level, characterObj.experience, characterObj.uniqueid], false, (result, resolve) => {
      resolve({ success: true });
    });
  },
};
