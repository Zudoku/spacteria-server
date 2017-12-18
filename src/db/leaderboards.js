const dbHandler = require('./databaseHandler.js');

module.exports = {
  getTopTen() {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM bosskill SORT BY difficulty DESC LIMIT 10;', [], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else {
            resolve({ success: true, leaderboard: result.rows });
          }
        });
      });
    });
  },
  addBossKill(room) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        connection.client.query('INSERT INTO bosskill(bossid,killtime,difficulty,achievedat, participants) VALUES ($1, $2, $3, $4, $5)',
        [], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB error' });
          } else {
            resolve({ success: true, leaderboard: result.rows });
          }
        });
      });
    });
  },
};
