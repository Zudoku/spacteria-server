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

  request.post('https://www.googleapis.com/oauth2/v4/token',
    {
      code: googleCode,
      client_id: serverconfig.google_oauth_client_id,
      client_secret: serverconfig.google_oauth_client_secret,
      redirect_uri: serverconfig.google_oauth_callback_uri,
      grant_type: 'authorization_code',
    }, (error, response, body) => {
      console.log(body);
      console.log(response);
      const accessToken = response.access_token;
      if (!response.error) {
        request({
          url: 'https://www.googleapis.com/oauth2/v2/userinfo',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }, (error2, response2, body2) => {
          console.log(error2);
          console.log(response2);
          console.log(body2);
        });
      }
    });


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
