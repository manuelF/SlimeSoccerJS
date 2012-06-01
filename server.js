
/**
 * Module dependencies.
 */

var express = require('express')
  , sio = require('socket.io')
  , http = require('http');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('.html', require('jade'));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.render('index', {layout: false});
});
var server = http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});


var io = sio.listen(server);

io.sockets.on('connection', function(socket){
  socket.on('key Up', function(data){
    console.log('up');
    socket.broadcast.emit('cli key Up', data);
  });
  socket.on('key Down', function(data){
    console.log('down');
    socket.broadcast.emit('cli key Down', data);
  });
});


