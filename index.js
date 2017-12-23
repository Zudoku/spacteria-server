const express = require('express');
const LEX = require('greenlock-express');
const path = require('path');
const socketIO = require('socket.io');
const gameserver = require('./src/gameserver');
const serverconfig = require('./config/serverconfig.js');

const app = express();
app.use(express.static(path.join(__dirname, 'webapp')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp', 'index.html'));
});

const lexObj = LEX.create({
  server: serverconfig.profile === 'production' ? 'https://acme-v01.api.letsencrypt.org/directory' : 'staging',
  email: 'arttu.siren@gmail.com',
  agreeTos: true,
  approveDomains: ['www.spacteria.com'],
  app,
});
const server = lexObj.listen(serverconfig.webserver_port_http, serverconfig.webserver_port_https);

const io = socketIO.listen(server);
gameserver.init(io);

process.on('unhandledRejection', r => console.log(r));
