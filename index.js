const express = require('express');

const app = express();
/* eslint new-cap: ["error", { "capIsNew": false }]*/
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const serverconfig = require('./config/serverconfig.js');

const serverlogic = require('./src/serverlogic');

app.use(express.static(path.join(__dirname, 'webapp')));
serverlogic.init(io);

app.get('/*', (req, res) => {
  res.sendfile(path.join(__dirname, 'webapp', 'index.html'));
});

http.listen(serverconfig.webserver_port, serverconfig.webserver_bind, () => {
  console.log(`Listening on ${serverconfig.webserver_bind}:${serverconfig.webserver_port}`);
});
