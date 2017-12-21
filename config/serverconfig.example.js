const config = {};

config.webserver_port = 3590;
config.webserver_bind = '0.0.0.0';

config.database_username = 'postgres';
config.database_password = 'postgres';
config.database_host = 'db';
config.database_databasename = 'postgres';
config.database_port = 5432;

config.profile = 'debug';

module.exports = config;