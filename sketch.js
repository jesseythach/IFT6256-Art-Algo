const margin = 2;
let canvasWidth;
let canvasHeight;

let cols;
let rows;
let cellSize = 50;
let noiseScale = 0.02; // check later
let zOff = 0;
let zNoiseSpeed = 0.001;
let flowField = [];
let flowMagnitude = 0.1;

let arrowLength = 25;

let avgFPS = 0;
let lastFPSImportance = 0.2;

let particles = [];
let nbParticles = 5000;

function setup() {
  canvasWidth = windowWidth - 2 * margin;
  canvasHeight = windowHeight - 2 * margin;
  createCanvas(canvasWidth, canvasHeight);

  // createCanvas(1200, 900);
  cols = ceil(width / cellSize);
  rows = ceil(height / cellSize);
  fr = createP("");
  angleMode(DEGREES);
  colorMode(HSB);

  for (let i = 0; i < nbParticles; i++) {
    particles[i] = new Particle(random(width), random(height));
  }
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
      );
      // fill((angle / 360 / 4) * 255);
      noFill();
      // noStroke();
      // rect(colInd * cellSize, rowInd * cellSize, cellSize, cellSize);

      unitVector = p5.Vector.fromAngle(radians(angle));
      flowField[colInd][rowInd] = unitVector.copy().mult(flowMagnitude);
      //text(angle, colInd*cellSize + cellSize/2, rowInd*cellSize + cellSize/2)

      let midPt = createVector(
        colInd * cellSize + cellSize / 2,
        rowInd * cellSize + cellSize / 2,
      );
      let endPt = midPt.copy().add(unitVector.mult(arrowLength));
      // line(midPt.x, midPt.y, endPt.x, endPt.y);
    }
  }
  zOff += zNoiseSpeed;
}

function updateFPS() {
  avgFPS = floor(
    avgFPS * (1 - lastFPSImportance) + frameRate() * lastFPSImportance,
  );
  fr.html(avgFPS);
  console.log(avgFPS);
}

function draw() {
  //noLoop()
  background(0, 0.03);

  stroke(1);
  computeFlowField();
  // colorPixel();

  for (let p = 0; p < nbParticles; p++) {
    particles[p].setNewForce(flowField);
    particles[p].updatePosition();
    particles[p].checkEdges();
    particles[p].display();
  }
}
