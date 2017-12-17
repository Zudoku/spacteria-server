const pg = require('pg');
const serverconfig = require('./../../config/serverconfig.js');

const pgconfig = {
  user: 'postgres',
  database: 'postgres',
  host: 'db',
  password: 'postgres',
  port: 5432,
  max: 10,
  idleTimeoutMills: 30000,
};

const debugpgconfig = {
  user: 'spacteria',
  database: 'spacteriagame',
  password: 'postgres',
  port: 5432,
  max: 10,
  idleTimeoutMills: 30000,
};

let pool;

function configureDBConnection() {
  pool = new pg.Pool(pgconfig);

  pool.on('error', (err, client) => {
    console.log('idle client error', err.message, err.stack, client);
  });
}

configureDBConnection();

module.exports = {
  getConnection() {
    return new Promise((resolve) => {
      if (pool === undefined || pool === null) {
        configureDBConnection();
      }
      pool.connect((err, client, done) => {
        if (err) {
          console.log(err);
        }
        resolve({
          err,
          client,
          done,
        });
      });
    });
  },
  getConfig() {
    return pgconfig;
  },
};
