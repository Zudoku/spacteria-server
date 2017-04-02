const dbHandler = require('./databaseHandler.js');

module.exports = {
  login(username, password) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gameuser WHERE username = $1 AND password = $2', [username, password], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB connection error' });
          }
          if (result.rows.length <= 0) {
            resolve({ success: false, msg: 'Wrong user / pass' });
          } else {
            const gameuser = result.rows[0];
            // TODO: rework to use gamesessiontoken
            resolve({ success: true, uniqueid: gameuser.uniqueid });
          }
        });
      });
    });
  },
};
