const app = require('express')();
/* eslint new-cap: ["error", { "capIsNew": false }]*/
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const config = require('./src/config.js');

const serverlogic = require('./src/serverlogic');

app.get('/', (req, res) => {
  res.sendfile(path.join(__dirname, 'public', 'index.html'));
});
serverlogic.init(io);

http.listen(config.webserver_port, config.webserver_bind, () => {
  console.log(`Listening on ${config.webserver_bind}:${config.webserver_port}`);
});
