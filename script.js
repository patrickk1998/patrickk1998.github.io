
var animate = window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
function(callback) { window.setTimeout(callback, 1000/60) };

//canvas 
var canvas = document.createElement('canvas');
var width = 1480;
var height = 700;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext('2d');
var angle = 0;
var transValue = [0,0];


window.onload = function() {
  document.body.appendChild(canvas);
  animate(step);
};

//key listner 

var keysDown = {};

window.addEventListener("keydown", function(event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});

// rendering help functions

var RotVect = function(V, theta, axis){
  if(axis == "x"){
    return(V[0]*Math.cos(theta) - V[1]*Math.sin(theta))
  }
  if(axis == "y"){
    return(V[0]*Math.sin(theta) + V[1]*Math.cos(theta))
  }

}

var Dist = function(a, b){
  return(Math.sqrt( Math.pow((a[0] - b[0]), 2) + Math.pow((a[1] - b[1]), 2) ))
}

var step = function() {
  update();
  render();
  animate(step);
};
// game data

var Bolts = [];

var player = new Rocket(75,75);

var Map = new World();

var update = function() {
  Gravity(this.Map.Moons, player);
  player.update();  
  Follow(player);
  var tempB = []
  for(var b = 0; b < Bolts.length; b++){
    Bolts[b].update();
    if(Bolts[b].r > 0){
      tempB.push(Bolts[b]);
    }
  }
  Bolts = tempB;
  tempB = [];
  print(Bolts);
};

var render = function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Map.render();
  player.render();
  for(var b = 0; b < Bolts.length; b++){
    Bolts[b].render();
  }

};

// rocket class

function Rocket(x, y){
  this.x = x;
  this.y = y;
  this.theta = 0;
  this.v = [0,0];
  this.mainThurster = 0; 
  this.retroThuster = 0;
  this.player = true;
  this.finiteFuel = true;
  this.Fuel = 100;
}

Rocket.prototype.render = function(){
  var x = this.x + transValue[0];
  var y = this.y + transValue[1];

  var theta = this.theta;
  var VA = [30,10];
  var VB = [30, -10];
  var VM = [27,0];
  var co = Math.cos(theta);
  var so = Math.sin(theta);

  var mtr = this.mainThurster;
  if(this.mainThurster > 8){
    mtr = 8;
  }
  if(this.player){
    Speed(this.v);
    FuelDisplay(this.Fuel);
  } 
  ctx.beginPath();
  ctx.arc(x + RotVect(VM, theta, "x"), y + RotVect(VM, theta, "y"), mtr, 0, 2*Math.PI, true)  
  ctx.fillStyle = "#f99740";
  ctx.fill();
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + RotVect(VA, theta, "x"), y + RotVect(VA, theta, "y"));
  ctx.lineTo(x + RotVect(VB, theta, "x"), y + RotVect(VB, theta, "y"));
  ctx.fill();
};

Rocket.prototype.input = function(){ 
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 37 || value == 65) { // left arrow
      this.theta = this.theta - 0.1;
    } else if (value == 39 || value == 68) { // right arrow
      this.theta = this.theta + 0.1;
    } else {
      this.theta = this.theta;
    }
    if(value == 40 || value == 83){ // down arrow
      if(this.Fuel > 0){
        this.Fuel = this.Fuel - 0.05;
        this.retroThurster = this.retroThurster + 0.3;
        this.mainThurster = 0;
        this.v[0] = this.v[0] + 0.01 * Math.cos(this.theta);
        this.v[1] = this.v[1] + 0.01 * Math.sin(this.theta);  
      }
    } else if (value == 38 || value == 87){ // up arrow     
      if(this.Fuel > 0){
        this.Fuel = this.Fuel - 0.175;
        this.mainThurster = this.mainThurster + 0.3;
        this.retroThuster = 0;
        this.v[0] = this.v[0] - 0.03 * Math.cos(this.theta);
        this.v[1] = this.v[1] - 0.03 * Math.sin(this.theta);
      } 
    } else{
      this.mainThurster = 0;
      this.retroThuster = 0;
    }
    if(value == 32){
      addBolt(180,this.v,3,10,10,this.theta,this.x,this.y);
    }
  }
}


Rocket.prototype.Move = function(){
  this.y = this.y + this.v[1]
  this.x = this.x + this.v[0]
}


Rocket.prototype.update = function(){
  this.input();
  this.Move();

}

// Moon class

function Moon( x, y, radius, active){
  this.active = active;
  this.x = x
  this.y = y 
  this.radius = radius 
}


Moon.prototype.render = function(){
  var x = this.x + transValue[0];
  var y = this.y + transValue[1];  

  ctx.beginPath();
  ctx.arc(x, y, this.radius, 0, 2*Math.PI, true)
  if(this.active = false){  
    ctx.fillStyle = "grey";
  } else {
    ctx.fillStyle = "#423f3d";
  }
  ctx.fill();
  ctx.fillStyle = "black";
}

// World class 

function World(){
  this.Moons = [new Moon( 400,300,45),new Moon(700,460, 65), 
  new Moon(1800,750, 100)];
}

World.prototype.render = function(){
  for(var i = 0;i < this.Moons.length; i++){
    this.Moons[i].render();
  }
}


//Bolt class

function Bolt(rad, vel, sp, srd, pw, tht, x, y){
  this.x = x;
  this.y = y;
  this.range = rad;
  this.vel = vel;
  this.speed = sp
  this.spread = srd;
  this.power = pw;
  this.theta = tht;
}

Bolt.prototype.update = function(){
  this.range = this.range - 1; 
  this.x = this.x - RotVect([this.speed, 0], this.theta, "x") + this.vel[0];
  this.y = this.y - RotVect([this.speed, 0], this.theta, "y") + this.vel[1];
}

Bolt.prototype.render = function(){
  console.log(this.x)
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(this.x + transValue[0], this.y+transValue[1], 4, 2*Math.PI, true);
  ctx.fill();
  ctx.fillStyle = "black";
}
// Gravity 

var Gravity = function( M, P){
  var D = 0;
  var gc = 0.001
  for(var i = 0; i < M.length;i++){
    D = Dist([M[i].x, M[i].y],[P.x,P.y]);
    P.v[0] =P.v[0] +  gc*Math.pow(M[i].radius, 3)*(M[i].x - P.x )/Math.pow(D,3);
    P.v[1] =P.v[1] +  gc*Math.pow(M[i].radius, 3)*(M[i].y - P.y)/Math.pow(D,3);
  }
}

//screen follow 
var Follow = function(P){
    if(P.x - 50 < transValue[0] || P.x + 50 > transValue[0] + width){
      transValue[0] = transValue[0] - P.v[0]*1;
    } 

    if(P.y - 50 < transValue[1] || P.y + 50 > transValue[1] + height){
      transValue[1] = transValue[1] - P.v[1]*1;
    } 
} 

//add bolt 

var addBolt = function(r, v, s, sp, p, t, x, y){
  console.log("bolts");
  Bolts.push(new Bolt(r,v, s, sp, p, t, x, y));
}

//display 

var Speed = function(v){
  var s = Dist(v, [0,0]);
  ctx.font = "san-serif";
  ctx.fillText(s.toFixed(2) + " km/s", 10,10);
}

var FuelDisplay = function(f){
  ctx.fillText("Fuel: " + f.toFixed(2) + " tons", 10, 25);
}
