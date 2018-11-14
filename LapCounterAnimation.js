var NUM_PULSES = 1000;
var PULSE_FREQ = 10;

/**
 * In order to use P5.js mode in Processing IDE, you need
 * to stick to pre-ES6 Javascript :/
 */
function Pulse(x, y) {
  // Speed in pixels/frame
  this.SPEED = 20
  this.pos = createVector(x, y);
  this.dist = 0;
  
  this.spread = function() {
    this.dist += this.SPEED;
  }
  
  this.draw = function() {
    noFill();
    stroke(255);
    ellipse(this.pos.x, this.pos.y, this.dist, this.dist);
  }
}

function BluetoothTag(pos) {
  this.SIZE = 40;
  this.pos = pos
  
  this.pulse = function() {
    return new Pulse(this.pos.x, this.pos.y);
  }
  
  this.move = function(pos) {
    this.pos = pos;
  }
  
  this.draw = function() {
    fill(0, 128, 255);
    stroke(0);
    ellipse(this.pos.x, this.pos.y, this.SIZE, this.SIZE);
  }
}

var POOL_START = 0.1;
var POOL_END = 0.9;
var POOL_LENGTH = POOL_END - POOL_START;
var POOL_WIDTH = 0.2;

function move_curve(t) {
  var OFFSET = 0.04;
  var freq = 0.01;
  var min_x = (POOL_START + OFFSET) * width;
  var max_x = (POOL_END - OFFSET) * width;
  var center = (min_x + max_x) / 2;
  var amplitude = (max_x - min_x) / 2;
  var x_wave = center + amplitude * -cos(freq * t);
  
  return createVector(x_wave, height / 2);
}

var pulses = [];
var tag;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  tag = new BluetoothTag(move_curve(0));
}

function draw() {
  background(64);
  
  // Draw a rectangle for the pool
  fill(0, 128, 200);
  stroke(0);
  rect(POOL_START * width, height / 2 - POOL_WIDTH * height/ 2, POOL_LENGTH * width, POOL_WIDTH * height);
  
  tag.draw();
  
  // Draw the pulses
  for (var i = 0; i < pulses.length; i++) {
    pulses[i].spread();
    pulses[i].draw();
  }
  
  tag.move(move_curve(frameCount));
   
  if (frameCount % PULSE_FREQ == 0) {
    pulses.push(tag.pulse());
    if (pulses.length > NUM_PULSES)
      pulses.shift();
  }
}
