const express = require('express');

const app = express();
/* eslint new-cap: ["error", { "capIsNew": false }]*/
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const serverconfig = require('./config/serverconfig.js');

const gameserver = require('./src/gameserver');

app.use(express.static(path.join(__dirname, 'webapp')));
gameserver.init(io);

/*
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp', 'index.html'));
}); */

http.listen(serverconfig.webserver_port, serverconfig.webserver_bind, () => {
  console.log(`[WEBSERVER]: Listening on ${serverconfig.webserver_bind}:${serverconfig.webserver_port}`);
});

process.on('unhandledRejection', r => console.log(r));
