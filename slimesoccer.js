
(function(){

  SlimeSoccer = function(id){
    this.canvas = document.getElementById(id);
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('keyup', function(event){Key.onKeyUp(event);}, false);
	  window.addEventListener('keydown', function(event){Key.onKeyDown(event);}, false);

	  this.height = 600;
    this.fps = 120;
    this.width = 700;
	  var baseline = this.height - 30;
	  this.players = new Array();
	  this.players.push(new Player(100, baseline, 1, "#FF0000", this));
	  this.players.push(new Player(400, baseline, 2, "#0000DD", this));
	  this.ball = new Ball(300, 300, this);

    var that = this;

	  this._intervalId = setInterval(function(){
      that.run();
    }, 0);
  };


  SlimeSoccer.prototype.draw = function() {
	  var ctx = this.ctx;
	  ctx.clearRect(0, 0, this.width, this.height);
	  drawField.call(this);
	  for(var i = 0; i<this.players.length; i++)
	  {
		  this.players[i].draw(ctx);
	  }
	  this.ball.draw(ctx);
  };

  SlimeSoccer.prototype.update = function(){
	  for(var i = 0; i<this.players.length; i++)
	  {
		  var player = this.players[i];
		  player.update();
  	}
	  this.ball.update();
  };

  SlimeSoccer.prototype.run = function()
  {
	  var skipTicks = 1000/ this.fps;
	  var nextGameTick = (new Date).getTime();
	  var loops =0;

		this.update();
		while((new Date).getTime()> nextGameTick)
		{
			//this.game.update
			nextGameTick += skipTicks;
		}
		this.draw();
  };


  function Player(_x, _y, _number, _color, game){
	  this.x = _x;
	  this.y = _y;
	  this.playerNumber = _number;
	  this.direction = 0;
    this.game = game;
	  if(_number==1) this.direction =1;
	  else this.direction = -1;
	  this.color = _color;

	  this.accelX = 0;
	  this.accelY = 0;
	  this.velX = 0;
	  this.velY = 0;
	  this.baseline = this.game.height - 30;

	  this.bbox={minX: 60, maxX : 60, minY :60, maxY : 0};
	  this.isGoingUp = 0;
  }

  Player.prototype.draw = function(ctx){
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

  Player.prototype.update = function(){
	  this.accelY=0.9; //gravity
	  this.accelX=this.velX=0;
	  if(this.playerNumber==2){
		  if(Key.isDown(Key.UP) && !this.isGoingUp){
        this.velY=-15;this.isGoingUp=1;
      }
		  if(Key.isDown(Key.LEFT)) this.velX-=3;
		  if(Key.isDown(Key.RIGHT)) this.velX+=3;
	  } else {
		  if(this.playerNumber==1){
			  if(Key.isDown(Key.W) && !this.isGoingUp){this.velY=-15;this.isGoingUp=1;}
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
	  if(this.x>=this.game.width-this.bbox.maxX) 	{this.x=this.game.width-this.bbox.maxX; stopX=1;}
	  //up boundary
	  if(this.y<=this.bbox.minY) 			{this.y=this.bbox.minY; stopY=1;}
	  //down boundary
	  if(this.y>this.game.height-this.bbox.maxY) 	{this.y=this.game.height-this.bbox.maxY; stopY=1;}

	  if(stopX==1){
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

	Player.prototype.hit = function(_x,_y)
	{
		if(this.y<_y) //due to the assimetry of the slime, if ball is lower than slime, not touching
			return {};
		var slime_radius = 60;
		var abs= Math.abs;
		var sq = function(x){return Math.pow(x,2);};
		var dx = this.x-_x;
		var dy = this.y-_y;
				
		if(sq(abs(dx))+sq(abs(dy)) > 60*60) //outside radius, not  touching
			return {};
		var angle = Math.atan((1.0*dy)/(1.0*dx));

		var newcoords = {x:(Math.sin(angle)), y:(Math.cos(angle))};
		
		
		return newcoords; 
		
	};
	
  function Ball(_x, _y, game){
  	this.x = _x;
	  this.y = _y;
	  this.color = "#FFFF00";
    this.game = game;

	  this.accelX = 0;
	  this.accelY = 0;
	  this.velX = 0;
	  this.velY = 0;
		
		this.radius = 7;

	  this.bbox={minX: this.radius, maxX : this.radius, minY :this.radius, maxY : this.radius};
  }

  Ball.prototype.update = function(){
	  var accelstep = 0.75;
	  this.accelY=0.9; //gravity
	  this.accelX=0;
	  //this.velX = this.velX + (0.5*((this.accelX)*(this.accelX)))*(this.accelX>0?1:-1);
	  this.x = this.x + this.velX;

	  this.velY = this.velY + (0.5*((this.accelY)*(this.accelY)))*(this.accelY>0?1:-1);
	  this.y = this.y + this.velY;
	  var stopX = 0, stopY = 0;
	  //left boundary
	  if(this.x<this.bbox.minX)
			{this.x=this.bbox.minX; stopX=1;}
	  //right boundary
	  if(this.x>=this.game.width-this.bbox.maxX)
			{this.x=this.game.width-this.bbox.maxX; stopX=1;}
	  //up boundary
	  if(this.y<=this.bbox.minY)
			{this.y=this.bbox.minY; stopY=1;}
	  //down boundary
	  if(this.y>this.game.height-this.bbox.maxY)
			{this.y=this.game.height-this.bbox.maxY; stopY=1;}

		for(var i=0;i<this.game.players.length;i++)
		{	
			var coords =this.game.players[i].hit(this.x-this.radius,this.y+this.radius);
			if (coords.x!== undefined)
			{
				if(this.velX<=0.001) this.velX+=10;
				this.velX*=-coords.x;
				if(this.velY<=0.001) this.velY+=10;
				this.velY*=-coords.y;
				break;
			}
		}
			
	  if(stopX==1) //left or right wall
	  {
		  this.velX*= -1;
	  }
		if(stopY==1) //floor or celing
		{
			this.velY*=-1;

			if(Math.abs(this.accelY)>0.001)
			{
				this.velX *= 1;
			}else
			{
				this.velX = 0;
			}
		}
  };

  Ball.prototype.draw = function()
  {
    var ctx = this.game.ctx;
	  var radius = 7;
	  ctx.beginPath();
	  ctx.arc(this.x, this.y, radius, 0, 2*Math.PI, true);
	  ctx.closePath();
	  ctx.fillStyle = this.color;
	  ctx.fill();
  };

  var drawField = function(){
	  var ctx = this.ctx;
	  //sky
	  ctx.beginPath();
	  ctx.rect(0,0,this.width, this.height/2);
	  ctx.fillStyle="#0000FF"; //dark green
	  ctx.fill();


	  //field
	  ctx.beginPath();
	  ctx.rect(0,this.height/2,this.width,this.height);
	  ctx.fillStyle="#11EE11"; //dark green
	  ctx.fill();


	  //floor
	  ctx.beginPath();
	  ctx.moveTo(0,this.height-1);
	  ctx.lineTo(this.width,this.height-1);
	  ctx.lineWidth = 1;
	  ctx.strokeStyle = "#FFFFFF";
	  ctx.stroke();



	  //goalpost 1

	  var goalpostHeight = 150;
	  ctx.beginPath();
	  ctx.moveTo(40,this.height-1);
	  ctx.lineTo(40,this.height-goalpostHeight);
	  ctx.lineTo(0,this.height-goalpostHeight);
	  ctx.lineWidth = 15;
	  ctx.strokeStyle= "#000000";
	  ctx.stroke();
	  ctx.strokeStyle= "#FFFFFF";
	  ctx.lineWidth = 10;
	  ctx.stroke();

	  //goalpost 2
	  var goalpostHeight = 150;
	  ctx.beginPath();
	  ctx.moveTo(this.width-40,this.height-1);
	  ctx.lineTo(this.width-40,this.height-goalpostHeight);
	  ctx.lineTo(this.width,this.height-goalpostHeight);
	  ctx.lineWidth = 15;
	  ctx.strokeStyle= "#000000";
	  ctx.stroke();
	  ctx.strokeStyle= "#FFFFFF";
	  ctx.lineWidth = 10;
	  ctx.stroke();
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

	  isDown: function(keyCode){
      return this._pressed[keyCode];
    },

	  onKeyDown: function(event){
      this._pressed[event.keyCode]=true;
    },

	  onKeyUp: function(event){
      delete this._pressed[event.keyCode];
    }
  };


})();
