function getCtx()
{
	var canvas = document.getElementById('slimes');
	var ctx = canvas.getContext('2d');
	return ctx;
}
var Key = {
	_pressed: {},
	LEFT : 37,
	UP : 38,
	RIGHT : 39,
	DOWN : 40,
	W: 87, //lowercase!
	A: 65,  //lowercas
	D: 68, //lowercase
	
	isDown: function(keyCode)
	{ return this._pressed[keyCode];},
	
	onKeyDown: function(event)
	{ this._pressed[event.keyCode]=true;},
	
	onKeyUp: function(event)
	{ delete this._pressed[event.keyCode];},
};
function Player(_x, _y, _number, _color)
{
	this.x = _x;
	this.y = _y;
	this.playerNumber = _number;
	this.direction = 0;
	if(_number==1) this.direction =1;
	else this.direction = -1;
	this.color = _color;
	
	this.accelX = 0;
	this.accelY = 0;
	this.velX = 0;
	this.velY = 0;
	this.baseline = Game.height - 30;
	
	this.bbox={minX: 60, maxX : 60, minY :60, maxY : 0};
	this.isGoingUp = 0;
}
Player.prototype.draw = function(ctx)
{
	var radius = 60;
	var radiusEye = 5;
	var startAngle = 0;
	var endAngle = Math.PI;
	var clockwise = true;
	var color ="#00FF00";
	
	
	ctx.beginPath();        
		ctx.arc(this.x, this.y, radius, startAngle, endAngle, clockwise);
	ctx.closePath();
	ctx.fillStyle = this.color;
	ctx.fill();
	
	ctx.beginPath();
		ctx.arc(this.x+((radius/2)*this.direction), this.y-(radius/2),radiusEye, 0, Math.PI*2, true);
	ctx.closePath();
	ctx.fillStyle= "#000000";//"#FFFFFF";
	ctx.fill();
};

Player.prototype.update = function()
{
	var accelstep = 1.09;
	this.accelY+=0.045; //gravity
	this.accelX=this.velX=0;
	if(this.playerNumber==2)
	{
		if(Key.isDown(Key.UP) && !this.isGoingUp){ this.accelY-=accelstep;this.isGoingUp=1;}
		//if(Key.isDown(Key.DOWN)) this.accelY+=accelstep;
		if(Key.isDown(Key.LEFT)) this.velX-=3;//this.accelX-=accelstep/5;
		if(Key.isDown(Key.RIGHT)) this.velX+=3;//this.accelX+=accelstep/5;
	}
	else
	{
		if(this.playerNumber==1)
		{
			if(Key.isDown(Key.W) && !this.isGoingUp){ this.accelY-=accelstep;this.isGoingUp=1;}
			if(Key.isDown(Key.A)) this.velX-=3;
			if(Key.isDown(Key.D)) this.velX+=3;
		}
	}
	this.velX = this.velX + (0.5*((this.accelX)*(this.accelX)))*(this.accelX>0?1:-1);
	this.x = this.x + this.velX;
	
	this.velY = this.velY + (0.5*((this.accelY)*(this.accelY)))*(this.accelY>0?1:-1);
	this.y = this.y + this.velY;
	
	var stopX = 0, stopY = 0;
	//left boundary
	if(this.x<this.bbox.minX) 			{this.x=this.bbox.minX; stopX=1;}
	//right boundary
	if(this.x>=Game.width-this.bbox.maxX) 	{this.x=Game.width-this.bbox.maxX; stopX=1;}
	//up boundary
	if(this.y<=this.bbox.minY) 			{this.y=this.bbox.minY; stopY=1;}
	//down boundary
	if(this.y>Game.height-this.bbox.maxY) 	{this.y=Game.height-this.bbox.maxY; stopY=1;}
	
	if(stopX==1)
	{
		this.velX= 0.0;
		this.accelX=0.0;
	}
	if(stopY==1)
	{
		this.velY= 0.0;
		this.accelY=0.0;
		this.isGoingUp=0;		
	}
	
};
var Game = { fps: 120, width:700, height:600};

function drawField()
{
	var ctx = getCtx();
	//sky
	ctx.beginPath();
	ctx.rect(0,0,Game.width, Game.height/2);
	ctx.fillStyle="#0000FF"; //dark green
	ctx.fill();
	
	
	//field
	ctx.beginPath();
	ctx.rect(0,Game.height/2,Game.width,Game.height);
	ctx.fillStyle="#11EE11"; //dark green
	ctx.fill();
	
	
	//floor
	ctx.beginPath();
	ctx.moveTo(0,Game.height-1);
	ctx.lineTo(Game.width,Game.height-1);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#FFFFFF";
	ctx.stroke();
	
	
	
	//goalpost 1
	
	var goalpostHeight = 150;
	ctx.beginPath();
	ctx.moveTo(40,Game.height-1);
	ctx.lineTo(40,Game.height-goalpostHeight);
	ctx.lineTo(0,Game.height-goalpostHeight);
	ctx.lineWidth = 15;
	ctx.strokeStyle= "#000000";
	ctx.stroke();
	ctx.strokeStyle= "#FFFFFF";
	ctx.lineWidth = 10;
	ctx.stroke();
	
	//goalpost 2
	var goalpostHeight = 150;
	ctx.beginPath();
	ctx.moveTo(Game.width-40,Game.height-1);
	ctx.lineTo(Game.width-40,Game.height-goalpostHeight);
	ctx.lineTo(Game.width,Game.height-goalpostHeight);
	ctx.lineWidth = 15;
	ctx.strokeStyle= "#000000";
	ctx.stroke();
	ctx.strokeStyle= "#FFFFFF";
	ctx.lineWidth = 10;
	ctx.stroke();
	
}

Game.draw = (function() {
	var ctx = getCtx();
	ctx.clearRect(0, 0, Game.width, Game.height);
	drawField();
	for(var i = 0; i<Game.players.length; i++)
	{
		Game.players[i].draw(ctx);
	}
});

Game.update = (
function()
{
for(var i = 0; i<Game.players.length; i++)
	{
		var player = Game.players[i];
		player.update();
	}
}
);
Game.fps = 60;
Game.run = (function() 
{	
	var skipTicks = 100/ Game.fps;
	var nextGameTick = (new Date).getTime();
	var loops =0;
	
	return function()
	{
		Game.update();
		while((new Date).getTime()> nextGameTick)
		{
			//Game.update
			nextGameTick += skipTicks;
		}
		Game.draw();
	};
})();

function init()
{
	window.addEventListener('keyup', function(event){Key.onKeyUp(event);}, false);
	window.addEventListener('keydown', function(event){Key.onKeyDown(event);}, false);
	
	var height = Game.height;
	var baseline = height - 30;
	Game.players = new Array();
	Game.players.push(new Player(100, baseline, 1, "#FF0000"));
	Game.players.push(new Player(400, baseline, 2, "#0000DD"));
	
	
	Game._intervalId = setInterval(Game.run, 0);
	return;
}



