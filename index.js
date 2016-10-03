const app = require('express')();
/* eslint new-cap: ["error", { "capIsNew": false }]*/
const http = require('http').Server(app);
const io = require('socket.io')(http);

const config = require('./config.js');

const serverlogic = require('./serverlogic');

app.get('/', (req, res) => {
  res.sendfile('index.html');
});
serverlogic.init(io);

http.listen(config.webserver_port, config.webserver_bind, () => {
  console.log(`Listening on ${config.webserver_bind}:${config.webserver_port}`);
});
