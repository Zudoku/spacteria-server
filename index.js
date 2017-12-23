const express = require('express');
const LEX = require('greenlock-express');
const path = require('path');
const socketIO = require('socket.io');
const https = require('https');
const http = require('http');
const leChallengeFS = require('le-challenge-fs');
const leStoreCertbot = require('le-store-certbot');
const gameserver = require('./src/gameserver');
const serverconfig = require('./config/serverconfig.js');

const app = express();
app.use(express.static(path.join(__dirname, 'webapp')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp', 'index.html'));
});

const lexObj = LEX.create({
  server: serverconfig.profile === '----' ? 'https://acme-v01.api.letsencrypt.org/directory' : 'staging',
  email: 'arttu.siren@gmail.com',
  agreeTos: true,
  approveDomains: ['www.spacteria.com'],
  app,
});
const server = lexObj.listen(80, 443);
console.log(server);

/*
const httpsServer = https.createServer(lexObj.httpsOptions, lexObj.middleware(app));
httpsServer.listen(serverconfig.webserver_port, serverconfig.webserver_bind, () => {
  console.log(`[WEBSERVER]: Listening on ${serverconfig.webserver_bind}:${serverconfig.webserver_port}`);
});
/*
http.createServer(lexObj.middleware(require('redirect-https')())).listen(9992, serverconfig.webserver_bind, function () {
  console.log('Listening for ACME http-01 challenges on', this.address());
});
 */
const io = socketIO.listen(server);
gameserver.init(io);

process.on('unhandledRejection', r => console.log(r));
