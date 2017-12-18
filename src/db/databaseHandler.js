const pg = require('pg');
const serverconfig = require('./../../config/serverconfig.js');

const pgconfig = {
  user: serverconfig.database_username,
  database: serverconfig.database_databasename,
  host: serverconfig.database_host,
  password: serverconfig.database_password,
  port: serverconfig.database_port,
  max: 10,
  idleTimeoutMills: 30000,
};

const debugpgconfig = {
  user: 'spacteria',
  database: 'spacteriagame',
  password: '9a7shdsa7yfh9s7ahf9asf8ashduyasodihas',
  port: 5432,
  max: 10,
  idleTimeoutMills: 30000,
};

let pool;

function configureDBConnection() {
  pool = serverconfig.profile === 'production' ? new pg.Pool(pgconfig) : new pg.Pool(debugpgconfig);

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
