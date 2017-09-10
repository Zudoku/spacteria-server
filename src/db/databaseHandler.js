const pg = require('pg');
const serverconfig = require('./../../config/serverconfig.js');

const pgconfig = {
  user: serverconfig.database_username,
  database: 'spacteriagame',
  password: serverconfig.database_password,
  port: 5432,
  max: 10,
  idleTimeoutMills: 30000,
};

const pool = new pg.Pool(pgconfig);

pool.on('error', (err, client) => {
  console.log('idle client error', err.message, err.stack, client);
});

module.exports = {
  getConnection() {
    return new Promise((resolve) => {
      pool.connect((err, client, done) => {
        resolve({
          err,
          client,
          done,
        });
      });
    });
  },
};
