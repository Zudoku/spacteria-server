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
        connection.client.query('SELECT * FROM gameuser WHERE token = $1', [token], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB connection error' });
          } else if (result.rows.length <= 0) {
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
      Promise.all([
        module.exports.getValidRegisterToken(registerToken),
        module.exports.getUniquePasswordToken(undefined, 0),
      ]).then((data) => {
        const validRegisterToken = data[0];
        const validPasswordToken = data[1];
        if (validPasswordToken.success && validPasswordToken.success && googleProfile.email !== undefined && googleProfile.verified_email) {
          Promise.all([
            module.exports.getUserWithEmail(googleProfile.email),
            module.exports.nullifyRegisterToken(registerToken),
          ]).then((result) => {
            if (result[0].success) {
              module.exports.changeUserPassword(validPasswordToken, googleProfile.email).then((userResult) => {
                if (userResult.success) {
                  resolve({ success: true, token: validPasswordToken, socketid: validRegisterToken.token.socketid });
                } else {
                  resolve({ success: false });
                }
              });
            } else {
              module.exports.addUser(validPasswordToken, googleProfile.email).then((userResult) => {
                if (userResult.success) {
                  resolve({ success: true, token: validPasswordToken, socketid: validRegisterToken.token.socketid });
                } else {
                  resolve({ success: false });
                }
              });
            }
          });
        }
      });
    });
  },
  addUser(token, email) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        connection.client.query('INSERT INTO gameuser (joined,token,email) VALUES (CURRENT_TIMESTAMP, $1, $2)', [token, email], (err, result) => {
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
  changeUserPassword(token, email) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        connection.client.query('UPDATE gameuser SET token = $1 WHERE email = $2', [token, email], (err, result) => {
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
  getUserWithEmail(email) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gameuser WHERE email = $1', [email], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB connection error' });
          } else if (result.rows.length <= 0) {
            resolve({ success: false, msg: 'Bad email' });
          } else {
            const gameuser = result.rows[0];
            resolve({ success: true, uniqueid: gameuser.uniqueid });
          }
        });
      });
    });
  },
  nullifyRegisterToken(registerToken) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        /* eslint max-len: "off"*/
        /* eslint no-unused-vars: "off"*/
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
  /* eslint consistent-return: "off"*/
  getUniqueRegisterToken(socketid, resolve, generationTry) {
    if (resolve === undefined) {
      return new Promise((resolveNew) => {
        module.exports.tryAddRegisterToken(socketid, resolveNew, 0);
      });
    } else if (generationTry < 5) {
      module.exports.tryAddRegisterToken(socketid, resolve, generationTry + 1);
    } else {
      resolve({ success: false });
    }
  },
  tryAddRegisterToken(socketid, promiseResolve, generationTry) {
    dbHandler.getConnection().then((connection) => {
      if (connection.err) {
        connection.done(connection.err);
        promiseResolve({ success: false });
        return;
      }
      crypto.randomBytes(128, (errCrypto, buffer) => {
        if (errCrypto) {
          promiseResolve({ success: false });
          return;
        }
        const token = buffer.toString('hex');
        const expires = new Date(1800000 + new Date().getTime());
        connection.client.query('INSERT INTO gameregistertoken (token,socketid,nullified,expires) VALUES ($1, $2, $3, $4)', [token, socketid, false, expires], (err, result) => {
          connection.done(err);
          if (err) {
            module.exports.getUniqueRegisterToken(socketid, promiseResolve, generationTry);
          } else {
            promiseResolve({ success: true, token });
          }
        });
      });
    });
  },
  getValidRegisterToken(token) {
    return new Promise((resolve) => {
      dbHandler.getConnection().then((connection) => {
        if (connection.err) {
          connection.done(connection.err);
          resolve({ success: false });
        }
        connection.client.query('SELECT * FROM gameregistertoken WHERE token = $1 AND nullified = FALSE AND expires >= CURRENT_TIMESTAMP', [token], (err, result) => {
          connection.done(err);
          if (err) {
            resolve({ success: false, msg: 'DB connection error' });
          } else if (result.rows.length <= 0) {
            resolve({ success: false, msg: 'Bad token.' });
          } else {
            const validToken = result.rows[0];
            resolve({ success: true, token: validToken });
          }
        });
      });
    });
  },
  getUniquePasswordToken(resolve, generationTry) {
    if (resolve === undefined) {
      return new Promise((resolveNew) => {
        module.exports.tryGetPasswordToken(resolveNew, 0);
      });
    } else if (generationTry < 5) {
      module.exports.tryGetPasswordToken(resolve, generationTry + 1);
    } else {
      resolve({ success: false });
    }
  },
  tryGetPasswordToken(promiseResolve, generationTry) {
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
        const token = buffer.toString('base64');
        connection.client.query('SELECT * FROM gameuser WHERE token = $1', [token], (err, result) => {
          connection.done(err);
          if (err) {
            module.exports.getUniqueRegisterToken(promiseResolve, generationTry);
          } else if (result.rows.length <= 0) {
            promiseResolve({ success: true, token });
          } else {
            module.exports.getUniqueRegisterToken(promiseResolve, generationTry);
          }
        });
      });
    });
  },
};
