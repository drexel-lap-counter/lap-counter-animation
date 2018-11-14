var NUM_PULSES = 1000;
var PULSE_FREQ = 10;

/**
 * In order to use P5.js mode in Processing IDE, you need
 * to stick to pre-ES6 Javascript :/
 */
function Pulse(x, y) {
  // Speed in pixels/frame
  this.SPEED = 10;
  this.pos = createVector(x, y);
  this.dist = 0;
  
  this.spread = function() {
    this.dist += this.SPEED;
  }
  
  this.draw = function() {
    noFill();
    stroke(200);
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

function move_curve(t) {
  var freq = 0.01;
  var min_x = 50;
  var max_x = width - 50;
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
