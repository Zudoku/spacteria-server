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
  console.error(pool);

  pool.on('error', (err, client) => {
    console.error('idle client error', err.message, err.stack, client);
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
        console.error(err);
        console.error(client);
        console.error(done);
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
