const express = require('express');
const LEX = require('greenlock-express');
const path = require('path');
const socketIO = require('socket.io');
const request = require('request');
const gameserver = require('./src/gameserver.js');
const userlogin = require('./src/db/userlogin.js');
const serverconfig = require('./config/serverconfig.js');

const changelog = require('./documentation/changelog.js');

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp', 'static', 'landingpage.html'));
});
app.use(express.static(path.join(__dirname, 'webapp', 'static')));

app.get('/clientversion', (req, res) => {
  // res.set('Content-Type', 'plain/text');
  res.send(`${serverconfig.client_version}`);
});

app.get('/changelog.json', (req, res) => {
  res.json(changelog.changelog);
});

app.get('/register', (req, res) => {
  const registerToken = req.query.token;
  if (registerToken) {
    userlogin.getValidRegisterToken(registerToken).then((result) => {
      if (result.success) {
        /* eslint max-len: "off"*/
        res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${serverconfig.google_oauth_client_id}&redirect_uri=${serverconfig.google_oauth_callback_uri}&scope=email&access_type=online&state=${registerToken}&response_type=code`);
      } else {
        res.sendFile(path.join(__dirname, 'webapp', 'static', 'registererror.html'));
      }
    });
  } else {
    res.sendFile(path.join(__dirname, 'webapp', 'static', 'registererror.html'));
  }
});

app.get('/google/redirect', (req, res) => {
  const googleCode = req.query.code;
  const registerToken = req.query.state;
  const options = {
    url: 'https://www.googleapis.com/oauth2/v4/token',
    method: 'POST',
    form: {
      code: googleCode,
      client_id: serverconfig.google_oauth_client_id,
      client_secret: serverconfig.google_oauth_client_secret,
      redirect_uri: 'https://spacteria.com/google/redirect',
      grant_type: 'authorization_code',
    },
  };
  if (googleCode !== undefined) {
    request(options, (error, response, body) => {
      const jsonBody = JSON.parse(body);
      const accessToken = jsonBody.access_token;

      if (accessToken !== undefined) {
        const options2 = {
          url: 'https://www.googleapis.com/userinfo/v2/me',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        request(options2, (error2, response2, body2) => {
          const jsonBody2 = JSON.parse(body2);
          userlogin.tryRegisteringUser(jsonBody2, registerToken).then((result) => {
            if (result.success) {
              gameserver.sendPasswordToken(result.token, result.socketid);
              res.sendFile(path.join(__dirname, 'webapp', 'registersuccess.html'));
            } else {
              res.sendFile(path.join(__dirname, 'webapp', 'registererror.html'));
            }
          });
        });
      } else {
        res.sendFile(path.join(__dirname, 'webapp', 'registererror.html'));
      }
    });
  } else {
    res.sendFile(path.join(__dirname, 'webapp', 'registererror.html'));
  }
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
