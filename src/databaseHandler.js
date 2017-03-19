const pg = require('pg');
const config = require('./config.js');

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
  console.error('idle client error', err.message, err.stack, client);
});

/**
client.query('SELECT $1::int AS number', ['1'], (err, result) => {
  done(err);

  if (err) {
    return console.error('', err);
  }

  console.log(result.rows[0].number);
});
**/

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
