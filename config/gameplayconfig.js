const config = {};

config.allow_multiple_logins_on_account = false;
config.data_percistence = true;
config.zone_amount = 40;
config.publish_gameplay_config = false;// TODO




config.NPC_POSITION_BROADCAST_BUFFER = 4;
config.NPC_MOVE_CYCLE_AMOUNT = 0.25;
config.SIMULATION_INTERVAL = 1000 / 60;
config.PLAYER_REGEN_INTERVAL = 10;
config.LEVELCAPS = [
  800, 2600, 4100, 7200, 10000,
  14800, 20400, 29000, 43000, 67600,
  90800, 145600, 210800, 306100, 454000,
  515000, 575800, 644400, 770000, 1200000,
];

module.exports = config;
