const dbHandler = require('./databaseHandler.js');
const crypto = require('crypto');

module.exports = {
  login(token) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gameuser WHERE token = $2', [token], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB connection error' });
          }
          if (result.rows.length <= 0) {
            resolve({ success: false, msg: 'Bad token.' });
          } else {
            const gameuser = result.rows[0];
            resolve({ success: true, uniqueid: gameuser.uniqueid });
          }
        });
      });
    });
  },
  tryRegisteringUser(googleProfile, registerToken) {
    return new Promise((resolve) => {
      console.log(googleProfile.email);
      resolve(true);
    });
  },
  nullifyRegisterToken(registerToken) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        connection.client.query('UPDATE gameregistertoken SET nullified = TRUE WHERE token = $1', [registerToken], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB connection error' });
          } else {
            resolve({ success: true });
          }
        });
      });
    });
  },
  nullifyRegisterTokensForSocketId(socketid) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        connection.client.query('UPDATE gameregistertoken SET nullified = TRUE WHERE socketid = $1', [socketid], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB connection error' });
          } else {
            resolve({ success: true });
          }
        });
      });
    });
  },
  newRegisterToken(socketid) {
    return new Promise((resolve) => {
      module.exports.nullifyRegisterTokensForSocketId(socketid).then((result) => {
        if (result.success) {
          module.exports.getUniqueRegisterToken(socketid, undefined).then((tokenResult) => {
            if (tokenResult.success) {
              resolve({ success: true, token: tokenResult.token });
            } else {
              resolve({ success: false });
            }
          });
        } else {
          resolve({ success: false });
        }
      });
    });
  },
  getUniqueRegisterToken(socketid, resolve) {
    if (resolve !== undefined) {
      return new Promise((resolveNew) => {
        module.exports.tryAddRegisterToken(socketid, resolveNew);
      });
    }
    module.exports.tryAddRegisterToken(socketid, resolve);
  },
  tryAddRegisterToken(socketid, promiseResolve) {
    dbHandler.getConnection().then((connection) => {
      if (connection.err) {
        connection.done(connection.err);
        promiseResolve({ success: false });
        return;
      }
      crypto.randomBytes(2048, (errCrypto, buffer) => {
        if (errCrypto) {
          promiseResolve({ success: false });
          return;
        }
        const token = buffer.toString('hex');
        const expires = new Date(1800000 + new Date().getTime());
        connection.client.query('INSERT INTO gameregistertoken (token,socketid,openregister,allowgoogle,registercomplete,nullified,expires) VALUES ($1, $2, $3, $4, $5, $6, $7)', [token, socketid, false, false, false, false, expires], (err, result) => {
          connection.done(err);
          if (err) {
            module.exports.getUniqueRegisterToken(socketid, promiseResolve);
          } else {
            promiseResolve({ success: true, token });
          }
        });
      });
    });
  },
};
