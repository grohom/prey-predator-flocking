var world;
var Zaxis;
var predatorSettings;
var preySettings;
// var vcolor;
// var canvas;

/* ************************************************************************************************************** */
var preyParameters = {
  // physical:
  bodyRadius: 2, tailLength: 7,
  bodyColor: "rgb(200,200,150)", tailColor: "rgb(200,200,150)",
  population: 40,
  maxForce: 2, mass: 2, friction: 0.05,
  // biological:
  minRandomForce: 0, randomForce: 0.1, seeingDistance: 1000, FOV: 20,
  // social:
  privateRadius: 50, attractStrength: 2,
  attractOtherStrength: 0, repelOtherStrength: 2
};

var predatorParameters = {
  // physical:
  bodyRadius: 2, tailLength: 7,
  bodyColor: "rgb(255,0,0)", tailColor: "rgb(255,0,0)",
  population: 25,
  maxForce: 2, mass: 1, friction: 0.1,
  // biological:
  minRandomForce: 0, randomForce: 0.1, seeingDistance: 1000, FOV: 120,
  // social:
  privateRadius: 30, attractStrength: 1,
  attractOtherStrength: 1000, repelOtherStrength: 0
};

/* ************************************************************************************************************** */
QuickSettings.addPrototypeSetting = function(func, name, value, min, max, step) {
  func.prototype[name] = value;
  return this.bindRange(name, min, max, value, step, func.prototype);
}

/* ****************************************************************************************************************
 * setup
 **************************************************************************************************************** */ 
function setup() {
  createCanvas(windowWidth, windowHeight).mouseClicked(addMousePredator);
  smooth();
  ellipseMode(RADIUS);
  angleMode(DEGREES);
  vcolor = color(255,0,0);
  Zaxis = createVector(0,0,-1);
  var radius = 24;
  var borders = {'left': 0+radius, 'right': width-radius, 'top': 0+radius, 'bottom': height-radius, 'elasticity': 1, 'radius': radius};
  world = new World(borders);
  for (var i = 0; i < Prey.prototype.population; i++) world.addPrey(new Prey(random(0,width),random(0,height)));
  for (var i = 0; i < Predator.prototype.population; i++) world.addPredator(new Predator(random(0,width),random(0,height)));
  // canvas.parent('world');

  QuickSettings.useExtStyleSheet();

  preySettings = QuickSettings.create(20, 20, 'Prey')
    .addPrototypeSetting(Prey, 'population', preyParameters.population, 0, 100, 1)
    .addPrototypeSetting(Prey, 'maxForce', preyParameters.maxForce, 0, 20, 0.2)
    .addPrototypeSetting(Prey, 'mass', preyParameters.mass, 0.2, 20, 0.2)
    .addPrototypeSetting(Prey, 'friction', preyParameters.friction, 0.01, 1, 0.01)
    .addPrototypeSetting(Prey, 'randomForce', preyParameters.randomForce, 0, 1, 0.1)
    .addPrototypeSetting(Prey, 'seeingDistance', preyParameters.seeingDistance, 0, 1000, 50)
    .addPrototypeSetting(Prey, 'FOV', preyParameters.FOV, 0, 360, 2)
    .addPrototypeSetting(Prey, 'privateRadius', preyParameters.privateRadius, 10, 500, 10)
    .addPrototypeSetting(Prey, 'attractStrength', preyParameters.attractStrength, 0, 20, 0.5)
    .addPrototypeSetting(Prey, 'attractOtherStrength', preyParameters.attractOtherStrength, 0, 5000, 100)
    .addPrototypeSetting(Prey, 'repelOtherStrength', preyParameters.repelOtherStrength, 0, 20, 0.5);
  Prey.prototype.bodyRadius = preyParameters.bodyRadius;
  Prey.prototype.tailLength = preyParameters.tailLength;
  Prey.prototype.bodyColor = color(preyParameters.bodyColor);
  Prey.prototype.tailColor = color(preyParameters.tailColor);
  Prey.prototype.minRandomForce = preyParameters.minRandomForce;

  predatorSettings = QuickSettings.create(windowWidth-180, 20, 'Predator')
    .addPrototypeSetting(Predator, 'population', predatorParameters.population, 0, 100, 1)
    .addPrototypeSetting(Predator, 'maxForce', predatorParameters.maxForce, 0, 20, 0.2)
    .addPrototypeSetting(Predator, 'mass', predatorParameters.mass, 0.2, 20, 0.2)
    .addPrototypeSetting(Predator, 'friction', predatorParameters.friction, 0.01, 1, 0.01)
    .addPrototypeSetting(Predator, 'randomForce', predatorParameters.randomForce, 0, 1, 0.1)
    .addPrototypeSetting(Predator, 'seeingDistance', predatorParameters.seeingDistance, 0, 1000, 50)
    .addPrototypeSetting(Predator, 'FOV', predatorParameters.FOV, 0, 360, 2)
    .addPrototypeSetting(Predator, 'privateRadius', predatorParameters.privateRadius, 10, 500, 10)
    .addPrototypeSetting(Predator, 'attractStrength', predatorParameters.attractStrength, 0, 20, 0.5)
    .addPrototypeSetting(Predator, 'attractOtherStrength', predatorParameters.attractOtherStrength, 0, 5000, 100)
    .addPrototypeSetting(Predator, 'repelOtherStrength', predatorParameters.repelOtherStrength, 0, 20, 0.5);
  Predator.prototype.bodyRadius = predatorParameters.bodyRadius;
  Predator.prototype.tailLength = predatorParameters.tailLength;
  Predator.prototype.bodyColor = color(predatorParameters.bodyColor);
  Predator.prototype.tailColor = color(predatorParameters.tailColor);
  Predator.prototype.minRandomForce = predatorParameters.minRandomForce;
}

/* ****************************************************************************************************************
 * draw
 **************************************************************************************************************** */ 
function draw() {
  background(25, 30, 51);
  world.live();
}

/* ****************************************************************************************************************
 * mouseClicked
 **************************************************************************************************************** */ 
function addMousePredator() {
  world.addPredator(new Predator(mouseX,mouseY));
  predatorSettings.setValue('population', 1+predatorSettings.getValue('population'));
  // return false;
}


/* ****************************************************************************************************************
 * World
 **************************************************************************************************************** */ 
function World(borders) {
  this.borders = borders;
  this.bodies = [];
  this.prey = [];
  this.predator = [];
}

World.prototype.live = function() {
  if (this.prey.length > Prey.prototype.population) {
    this.prey.length = Prey.prototype.population;
    this.bodies = this.prey.concat(this.predator);
  } else if (this.prey.length < Prey.prototype.population) {
    for (var i = 0; i < Prey.prototype.population - this.prey.length; i++) this.addPrey(new Prey(random(0,width),random(0,height)));
  }
  if (this.predator.length > Predator.prototype.population) {
    this.predator.length = Predator.prototype.population;
    this.bodies = this.prey.concat(this.predator);
  } else if (this.predator.length < Predator.prototype.population) {
    for (var i = 0; i < Predator.prototype.population - this.predator.length; i++) this.addPredator(new Predator(random(0,width),random(0,height)));
  }
  for (var i=0; i<this.bodies.length; i++) {
    var body = this.bodies[i];
    body.live(this.bodies, this.borders);
    if (body.vanished) body.reset(random(0,windowWidth),random(0,windowHeight));
  }
}

World.prototype.addPrey = function(prey) {
  this.bodies.push(prey);
  this.prey.push(prey);
}

World.prototype.addPredator = function(predator) {
  this.bodies.push(predator);
  this.predator.push(predator);
}

/* ****************************************************************************************************************
 * Body
 **************************************************************************************************************** */
function Body(x,y) {
  this.reset(x,y);
}

/* ************************************************************************************************************** */
 Body.prototype.reset = function(x,y) {
  this.vanished = false;
  this.position = createVector(x,y);
  this.velocity = p5.Vector.random2D(random(-PI, PI));
  this.acceleration = createVector(0,0);
}

/* ************************************************************************************************************** */
 Body.prototype.live = function(others, borders) {
  this.interact(others, borders);
  this.move();
  this.show();
}

/* ************************************************************************************************************** */
Body.prototype.interact = function(others, borders) {
  var bordersForce = createVector(0,0);
  if (this.position.x < borders.left) bordersForce.x = -borders.elasticity*(this.position.x - borders.left);
  if (this.position.x > borders.right) bordersForce.x = -borders.elasticity*(this.position.x - borders.right);
  if (this.position.y < borders.top) bordersForce.y = -borders.elasticity*(this.position.y - borders.top);
  if (this.position.y > borders.bottom) bordersForce.y = -borders.elasticity*(this.position.y - borders.bottom);
  this.applyForce(bordersForce);

  var frictionForce = p5.Vector.mult(this.velocity,-this.friction);
  this.applyForce(frictionForce);
}

/* ************************************************************************************************************** */
Body.prototype.applyForce = function(force) {
  this.acceleration.add(p5.Vector.div(force,this.mass));
}

/* ************************************************************************************************************** */
Body.prototype.move = function() {
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
  this.acceleration.mult(0);
}

/* ************************************************************************************************************** */
Body.prototype.show = function() {
  var tail = this.velocity.copy().setMag(-this.tailLength);
  stroke(this.tailColor);
  line(this.position.x, this.position.y, this.position.x + tail.x, this.position.y + tail.y);
  // stroke(vcolor);
  // line(this.position.x, this.position.y, this.position.x + 20*this.velocity.x, this.position.y + 20*this.velocity.y);

  fill(this.bodyColor);
  noStroke();
  ellipse(this.position.x, this.position.y, this.bodyRadius, this.bodyRadius);
}

/* ****************************************************************************************************************
 * Animal
 **************************************************************************************************************** */ 
function Animal(x,y) {
  Body.call(this,x,y);
}
Animal.prototype = Object.create(Body.prototype);
Animal.prototype.constructor = Animal;

/* ************************************************************************************************************** */
Animal.prototype.interact = function(others, borders) {
  Body.prototype.interact.call(this,others,borders);
  var traction = p5.Vector.random2D(random(-PI, PI));
  traction.mult(random(this.minRandomForce, this.randomForce));
  this.applyForce(traction);
  for (var i = 0; i < others.length; i++) this.observe(others[i]);
}

/* ************************************************************************************************************** */
Animal.prototype.observe = function(other) {}

/* ****************************************************************************************************************
 * Prey
 **************************************************************************************************************** */ 
function Prey(x,y) {
  Animal.call(this,x,y);
}
Prey.prototype = Object.create(Animal.prototype);
Prey.prototype.constructor = Prey;

/* ************************************************************************************************************** */
Prey.prototype.observe = function(other) {
  var direction = p5.Vector.sub(other.position,this.position);
  var d2 = direction.magSq();
  if (d2 == 0) return;
  var d = sqrt(d2);
  if (d > this.seeingDistance) return;
  direction.div(d);
  if (p5.Vector.angleBetween(this.velocity,direction) > this.FOV/2) return;
  var force = createVector(0,0);
  if (other instanceof Prey) force.add(p5.Vector.mult(direction, this.attractStrength*(1.0/d - this.privateRadius/d2)));
  else {
    if (d < this.bodyRadius + other.bodyRadius) {
      this.vanished = true;
      return;
    }
    force.add(direction.mult(-this.repelOtherStrength/d));
  }
  force.limit(this.maxForce);
  this.applyForce(force);
}

/* ****************************************************************************************************************
 * Predator
 **************************************************************************************************************** */ 
function Predator(x,y) {
  Animal.call(this,x,y);
}
Predator.prototype = Object.create(Animal.prototype);
Predator.prototype.constructor = Predator;

/* ************************************************************************************************************** */
Predator.prototype.observe = function(other) {
  var direction = p5.Vector.sub(other.position,this.position);
  var d2 = direction.magSq();
  if (d2 == 0) return;
  var d = sqrt(d2);
  if (d > this.seeingDistance) return;
  direction.div(d);
  if (p5.Vector.angleBetween(this.velocity,direction) > this.FOV/2) return;
  var force = createVector(0,0);
  if (other instanceof Predator) force.add(p5.Vector.mult(direction, this.attractStrength*(1.0/d - this.privateRadius/d2)));
  else {
    if (d < this.bodyRadius + other.bodyRadius) {
      other.vanished = true;
      return;
    }
    force.add(direction.mult(this.attractOtherStrength/d2));
  }
  force.limit(this.maxForce);
  this.applyForce(force);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  preySettings.setPosition(20, 20);
  predatorSettings.setPosition(windowWidth-220, 20);
  world.borders.left = world.borders.radius;
  world.borders.right = windowWidth-world.borders.radius;
  world.borders.top = world.borders.radius;
  world.borders.bottom = windowHeight-world.borders.radius;
}
