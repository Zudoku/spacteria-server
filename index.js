var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var config = require('./config.js');

var serverlogic = require('./serverlogic.js');

app.get('/', function(req,res){
  res.sendfile('index.html');
});

serverlogic.init(io);

http.listen(config.webserver_port,config.webserver_bind, function(){
  console.log('Listening on ' + config.webserver_bind + ':' +  config.webserver_port);
});
