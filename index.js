const express = require('express');
const LEX = require('greenlock-express');
const path = require('path');
const socketIO = require('socket.io');
const request = require('request');
const gameserver = require('./src/gameserver');
const serverconfig = require('./config/serverconfig.js');

const app = express();
// app.use(express.static(path.join(__dirname, 'webapp')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp', 'index.html'));
});

app.get('/register', (req, res) => {
  res.send(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${serverconfig.google_oauth_client_id}&redirect_uri=${serverconfig.google_oauth_callback_uri}&scope=email&access_type=online&state=123456&response_type=code`);
});

app.get('/google/redirect', (req, res) => {
  const googleCode = req.query.code;
  const state = req.query.state;
  const options = {
    url: 'https://www.googleapis.com/oauth2/v4/token',
    method: 'POST',
    form: {
      code: googleCode,
      client_id: serverconfig.google_oauth_client_id,
      client_secret: serverconfig.google_oauth_client_secret,
      redirect_uri: 'https://spacteria.com/google/done',
      grant_type: 'authorization_code',
    },
  };

  request(options, (error, response, body) => {
    const jsonBody = JSON.parse(body);
    const accessToken = jsonBody.access_token;
    console.log(jsonBody);
  });
  res.send(200);
});

app.get('/google/done', (req, res) => {
  res.send(200);
});


const lexObj = LEX.create({
  server: serverconfig.profile === 'production' ? 'https://acme-v01.api.letsencrypt.org/directory' : 'staging',
  email: 'arttu.siren@gmail.com',
  agreeTos: true,
  approveDomains: ['spacteria.com'],
  app,
});
const server = lexObj.listen(serverconfig.webserver_port_http, serverconfig.webserver_port_https);

const io = socketIO.listen(server);
gameserver.init(io);

process.on('unhandledRejection', r => console.log(r));
