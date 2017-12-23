const express = require('express');
const LEX = require('greenlock-express');
const path = require('path');
const socketIO = require('socket.io');
const https = require('https');
const leChallengeFS = require('le-challenge-fs');
const leStoreCertbot = require('le-store-certbot');
const gameserver = require('./src/gameserver');
const serverconfig = require('./config/serverconfig.js');

const app = express();
app.use(express.static(path.join(__dirname, 'webapp')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp', 'index.html'));
});

function approveDomains(opts, certs, cb) {
  /* eslint no-param-reassign: "off"*/
  if (certs) {
    opts.domains = ['www.spacteria.com'];
  } else {
    opts.email = 'arttu.siren@gmail.com';
    opts.agreeTos = true;
  }

  cb(null, { options: opts, certs });
}

const lexObj = LEX.create({
  server: serverconfig.profile === '----' ? 'https://acme-v01.api.letsencrypt.org/directory' : 'staging',
  challenges: { 'http-01': leChallengeFS.create({ webrootPath: '/tmp/acme-challenges' }) },
  store: leStoreCertbot.create({ webrootPath: '/tmp/acme-challenges' }),
  approveDomains,
});


const httpsServer = https.createServer(lexObj.httpsOptions, lexObj.middleware(app));
httpsServer.listen(serverconfig.webserver_port, serverconfig.webserver_bind, () => {
  console.log(`[WEBSERVER]: Listening on ${serverconfig.webserver_bind}:${serverconfig.webserver_port}`);
});

const io = socketIO.listen(httpsServer);
gameserver.init(io);

process.on('unhandledRejection', r => console.log(r));
