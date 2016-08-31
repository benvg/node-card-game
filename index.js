var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var players = [];
var numbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
var scored = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var slots = [0,0,0,0,0,0,0,0,0,0,0,0,0];
var gameStarted = false;
var totalScore = 0;

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/sound.wav', function(req, res){
  res.sendfile('sound.wav');
});

app.get('/fail.wav', function(req, res){
  res.sendfile('fail.wav');
});



io.on('connection', function(socket){


  socket.on('add player', function (nickname) {
  	if(!gameStarted){
  		var found = false;
  		if(players.length === 0){
  			setupGame();
  		}

	  	socket.nickname = nickname;

	  	for(var i=0; i< players.length || found; i++){
	  		found = (players[i].nickname === nickname);
	  	}

	  	if(!found){
	  		players.push({'nickname': nickname, 'points':0, 'previousPoints': 0})
	  	}

	  	io.emit('player joined', returnGameInfo(socket.nickname));
	  	console.log(players);
  	}else{
  		//game in progress
  	}
  });

  socket.on('score point',function(gameData){

  	//console.log(gameData);

  	if(scored[gameData.cardNumber-1]=== 0){
  		//repaint the board
  		scored[gameData.cardNumber-1] = 1;
  		slots[gameData.slotPosition] = 1;
  	
	  	var nickname = gameData.nickname;
	  	for(var i=0; i< players.length; i++){
	  		players[i].previousPoints = players[i].points 

	  		if(players[i].nickname === nickname){
	  			players[i].points++;
	  			totalScore++;
	  			io.emit('update scoreboard', returnGameInfo(socket.nickname));
	  		}

	  	}
  	} else {
  		//some else scored
  		io.emit('another player scored', returnGameInfo(socket.nickname));
  	}

  	if(totalScore === 12){
  		io.emit('game over',getResult());
  		setupGame();
  	}


  });

  socket.on('start game',function(){
  	resetGame();
  	//gameStarted = true;
  	io.emit('game has started', returnGameInfo(socket.nickname));
  });


});

function getResult(){
	var winner = {'nickname':'','points':0};
	var ties = 0;
	var message = '';
	for(var i=0; i< players.length; i++){
		if(players[i].points >= winner.points){
			winner = players[i];
			message += ' ' + players[i].nickname;
		}else if (players[i].points === winner.points){
			ties++;
			message += (ties === 0? '' : ' & ') + players[i].nickname;
		}
	}

	if(ties >0){
		message += ' tied with a score of '+ winner.points + ' points';
	}else {
		message = winner.nickname + ' won with a score of ' + winner.points + ' points';
	}

	return message;
}

function resetGame(){
	scored = [0,0,0,0,0,0,0,0,0,0,0,0,0];
	slots = [0,0,0,0,0,0,0,0,0,0,0,0,0];
	gameStarted = false;
	totalScore = 0;

	for(var i=0; i< players.length; i++){
		players[i].points = 0;
	}
}

function returnGameInfo(changedBy){
	var info = {
		'changedBy': changedBy,
		'numbers': numbers, 
		'players': players,
		'scored': scored,
		'slots': slots};
	console.log('game info:');
	console.log(info);

	console.log('totalScore:' + totalScore);
	return info;
}

function setupGame(){

  numbers.sort( function() { return Math.random() - .5 } );
}



http.listen(8080, function(){
  console.log('listening on *:8080');
});