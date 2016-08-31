var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var players = [];
var numbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
var scored = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var gameStarted = false;

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/sound.wav', function(req, res){
  res.sendfile('sound.wav');
});



io.on('connection', function(socket){


  socket.on('add player', function (nickname) {
  	if(!gameStarted){

  		if(players.length === 0){
  			setupGame();
  		}

	  	socket.nickname = nickname;
	  	players.push({'nickname': nickname, 'points':0})
	  	io.emit('player joined', returnGameInfo());
	  	console.log(players);
  	}
  });

  socket.on('score point',function(gameData){

  	console.log(gameData);

  	for(var i=0; i< players.length; i++){
  		if(players[i].nickname === nickname){
  			players[i].points++;

  			io.emit('update scoreboard', returnGameInfo());
  			i = players.length;
  		}
  	}

  });
});

function returnGameInfo(){
	var info = {'numbers': numbers, 'players': players};
	console.log(info);
	return info;
}

function setupGame(){

  numbers.sort( function() { return Math.random() - .5 } );
}



http.listen(3000, function(){
  console.log('listening on *:3000');
});