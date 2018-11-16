var NUM_PULSES = 1000;
var PULSE_FREQ = 10;


// Pool dimensions measured as a fraction of the screen dimensions
var POOL_START = 0.1;
var POOL_END = 0.9;
var POOL_LENGTH = POOL_END - POOL_START;
var POOL_WIDTH = 0.2;

var MAX_COLOR = 255;
var BG_COLOR = 64;

/**
 * In order to use P5.js mode in Processing IDE, you need
 * to stick to pre-ES6 Javascript :/
 */
function Pulse(x, y) {
  // Speed in pixels/frame
  this.SPEED = 25;
  this.pos = createVector(x, y);
  this.dist = 0;
  this.steps = 0;
  this.MAX_STEPS = 50;
  
  this.spread = function() {
    this.dist += this.SPEED;
    this.steps++;
  }
  
  this.draw = function() {
    if (this.steps > this.MAX_STEPS)
      return;

    // Fade out over time
    var alpha = MAX_COLOR - MAX_COLOR * this.steps / this.MAX_STEPS;
    noFill();
    stroke(MAX_COLOR, alpha);
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

function Phone() {
  this.pos = createVector(0.05, 0.5);
  this.RADIUS_STEP = 200;
  this.NUM_LINES = 10;
  this.w = 0.02;
  this.threshold = 285;
  
  this.state = "near";
  this.last_tag_dist = 0;
  this.lap_count = 0;
  
  this.pos_px = function() {
    var x = this.pos.x * width;
    var y = this.pos.y * height;
    return createVector(x, y);
  }
  
  this.update_threshold = function(mouse_x, mouse_y) {
    var mouse_pos = createVector(mouse_x, mouse_y);
    var dist = p5.Vector.sub(mouse_pos, this.pos_px()).mag();
    this.threshold = dist;
    console.log(dist);
  }
  
  this.update_lap_count = function(tag_pos) {
    var dist = p5.Vector.sub(tag_pos, this.pos_px()).mag();
    
    // If the swimmer returns to within the threshold,
    // increment the lap count
    if (this.state === "near" && dist > this.threshold) {
      this.state = "far";
    } else if (this.state === "far" && dist <= this.threshold) {
      this.state = "near";
      this.lap_count++;
    }
      
    this.last_tag_dist = dist;
  }
  
  this.draw = function() {
    push();
    // Center the coordinates on the center of the phone
    translate(this.pos.x * width, this.pos.y * height);
    
    // Draw a small rectangle for the smartphone
    var half_size = this.w / 2;
    stroke(0);
    fill(200);
    rect(-0.5 * this.w * width, -this.w * width, this.w * width, 2 * this.w * width);
    
    // Draw distance ranges every 100 px
    noFill();
    stroke(255, 255, 0, 128);
    for (var i = 0; i < this.NUM_LINES; i++) {
      var radius = i * this.RADIUS_STEP;
      ellipse(0, 0, radius, radius);
    }
    
    // Draw the threshold in red
    stroke(255, 0, 0);
    ellipse(0, 0, 2 * this.threshold, 2 * this.threshold);
    
    pop();
  }
}


function move_curve(t) {
  var OFFSET = 0.04;
  var freq = 0.015;
  var min_x = (POOL_START + OFFSET) * width;
  var max_x = (POOL_END - OFFSET) * width;
  var center = (min_x + max_x) / 2;
  var amplitude = (max_x - min_x) / 2;
  var x_wave = center + amplitude * -cos(freq * t);
  
  return createVector(x_wave, height / 2);
}

var pulses = [];
var tag;
var phone;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  tag = new BluetoothTag(move_curve(0));
  phone = new Phone();
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
  
  // Draw the phone
  phone.draw();
  
  // if the mouse is pressed, update the threshold:
  if (mouseIsPressed) {
    phone.update_threshold(mouseX, mouseY);
  }
  
  var next_pos = move_curve(frameCount);
  tag.move(move_curve(frameCount));
  
  phone.update_lap_count(next_pos);
   
  if (frameCount % PULSE_FREQ == 0) {
    pulses.push(tag.pulse());
    if (pulses.length > NUM_PULSES)
      pulses.shift();
  }
  
  var laps = 0;
  
  noStroke();
  fill(255);
  textSize(32);
  text("Distance: " + phone.last_tag_dist.toFixed(0) + " px", 20, 32);
  text("Laps: " + phone.lap_count, 20, 64);
}
