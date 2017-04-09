const pg = require('pg');
const config = require('./../config.js');

const pgconfig = {
  user: config.database_username,
  database: 'spacteriagame',
  password: config.database_password,
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
