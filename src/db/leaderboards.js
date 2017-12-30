const dbHandler = require('./databaseHandler.js');

module.exports = {
  getTopTen() {
    return dbHandler.simpleQuery('SELECT * FROM bosskill ORDER BY difficulty DESC, killtime LIMIT 10;', [], false, (result, resolve) => {
      resolve({ success: true, leaderboard: result.rows });
    });
  },
  addBossKill(room, boss) {
    const participants = room.players.map(player => ({ id: player.characterdata.uniqueid, name: player.characterdata.name }));
    return dbHandler.simpleQuery('INSERT INTO bosskill(bossid,killtime,difficulty,achievedat, participants) VALUES ($1, $2, $3, $4, $5)',
    [boss, room.mapDescription.spent, room.difficulty, new Date(), JSON.stringify(participants)], false, (result, resolve) => {
      resolve({ success: true });
    });
  },
};
