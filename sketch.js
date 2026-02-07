const margin = 2;
let pg;

let cols;
let rows;
let cellSize = 50;
let noiseScale = 0.02; // check later
let zOff = 0;
let zNoiseSpeed = 0.001;
let flowField = [];
let flowMagnitude = 0.1;
let arrowLength = cellSize / 2;
let adjacentNeighbours = [];

let avgFPS = 0;
let lastFPSImportance = 0.2;

let particles = [];
let nbParticles = 10000;

let isPlaying = false;

function windowResized() {
  let canvasWidth = windowWidth - 2 * margin;
  let canvasHeight = windowHeight - 2 * margin;
  resizeCanvas(canvasWidth, canvasHeight);
  pg.resizeCanvas(canvasWidth, canvasHeight);
  cols = ceil(width / cellSize);
  rows = ceil(height / cellSize);
}

function setup() {
  let canvasWidth = windowWidth - 2 * margin;
  let canvasHeight = windowHeight - 2 * margin;
  createCanvas(canvasWidth, canvasHeight);

  // Create the offscreen buffer
  pg = createGraphics(canvasWidth, canvasHeight);
  pg.colorMode(HSB);
  pg.background(0); // Initial black background

  cols = ceil(width / cellSize);
  rows = ceil(height / cellSize);
  fr = createP("");
  angleMode(DEGREES);
  colorMode(HSB);
}

function updateFPS() {
  avgFPS = floor(
    avgFPS * (1 - lastFPSImportance) + frameRate() * lastFPSImportance,
  );
  fr.html(avgFPS);
  console.log(avgFPS);
}

function colorPixel() {
  // todo when put true to draw gradient, maybe do no loop() so laptop doesn't crash and burn
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let colInd = floor(x / cellSize);
      let rowInd = floor(y / cellSize);

      let vector = flowField[colInd][rowInd];
      let angle = Math.atan2(vector.y, vector.x) * (180 / Math.PI) + 180;

      // lerpColor(color1, color2, nb between 0 and 1)

      // Calculate color
      let c = color(angle, 100, 100, 100);

      // Set pixel color
      set(x, y, c);
    }
  }
  updatePixels();
}

function computeFlowField() {
  for (let colInd = 0; colInd < cols; colInd++) {
    flowField[colInd] = [];
    for (let rowInd = 0; rowInd < rows; rowInd++) {
      let angle = int(
        noise(colInd * noiseScale, rowInd * noiseScale, zOff) * 360 * 4,
      ); // Allow the angle to do a full turn
      let unitVector = p5.Vector.fromAngle(radians(angle));
      flowField[colInd][rowInd] = unitVector.copy().mult(flowMagnitude);
    }
  }
  zOff += zNoiseSpeed;
}

function drawFlowField() {
  for (let colInd = 0; colInd < cols; colInd++) {
    for (let rowInd = 0; rowInd < rows; rowInd++) {
      // fill((angle / 360 / 4) * 255); // For grayscale
      // noFill();
      fill(255);
      // noStroke();
      rect(colInd * cellSize, rowInd * cellSize, cellSize, cellSize);

      let unitVector = flowField[colInd][rowInd].div(flowMagnitude);
      // text(angle, colInd*cellSize + cellSize/2, rowInd*cellSize + cellSize/2)

      let midPt = createVector(
        colInd * cellSize + cellSize / 2,
        rowInd * cellSize + cellSize / 2,
      );
      let endPt = midPt.copy().add(unitVector.mult(arrowLength));
      line(midPt.x, midPt.y, endPt.x, endPt.y);

      // Draw arrowhead
      let arrowSize = 4;
      let angle = atan2(endPt.y - midPt.y, endPt.x - midPt.x);

      push();
      translate(endPt.x, endPt.y);
      rotate(angle);
      line(0, 0, -arrowSize, arrowSize / 2);
      line(0, 0, -arrowSize, -arrowSize / 2);
      pop();
    }
  }
}

function drawInfluence() {
  fill(0);
  strokeWeight(2);
  stroke("orange");
  ellipse(mouseX, mouseY, cellSize * 3, cellSize * 3);
}

function draw() {
  // noLoop()
  background(0);
  pg.background(0, 0.03);

  stroke(1);
  computeFlowField();
  // drawFlowField();

  // colorPixel();
  for (let p = 0; p < particles.length; p++) {
    particles[p].setNewForce(flowField);
    particles[p].updatePosition();
    particles[p].checkEdges();
    particles[p].display(pg);
  }
  image(pg, 0, 0);
  drawInfluence();
}

function keyPressed() {
  // Space key
  if (keyCode === 32) {
    if (!isPlaying) {
      for (let i = 0; i < nbParticles; i++) {
        particles[i] = new Particle(random(width), random(height));
      }
      isPlaying = true;
    } else {
      isPlaying = false;
      particles = [];
    }
  }
}
