// Canvas
const margin = 2;

// Flow field
let cols;
let rows;
let cellSize = 50;
let noiseScale = 0.02; // check later
let zOff = 0;
let zNoiseSpeed = 0.001;
let flowField = [];
let flowMagnitude = 0.1;
let arrowLength = cellSize / 2;

// Particles
let particles = [];
let nbParticles = 100;

// ================================= Canvas =================================

function windowResized() {
  let canvasWidth = windowWidth - 2 * margin;
  let canvasHeight = windowHeight - 2 * margin;
  resizeCanvas(canvasWidth, canvasHeight);

  cols = ceil(width / cellSize);
  rows = ceil(height / cellSize);
}

function setup() {
  let canvasWidth = windowWidth - 2 * margin;
  let canvasHeight = windowHeight - 2 * margin;
  createCanvas(canvasWidth, canvasHeight);

  cols = ceil(width / cellSize);
  rows = ceil(height / cellSize);
  angleMode(DEGREES);
  colorMode(HSB);

  // Create particles at random positions
  for (let i = 0; i < nbParticles; i++) {
    particles[i] = new Particle(random(width), random(height));
  }
}

// ================================= Draw =================================

function generateFlowField() {
  for (let colInd = 0; colInd < cols; colInd++) {
    flowField[colInd] = [];
    for (let rowInd = 0; rowInd < rows; rowInd++) {
      fill(255);
      rect(colInd * cellSize, rowInd * cellSize, cellSize, cellSize);
      // Create angle based on Perlin noise at each cell
      let angle = int(
        noise(colInd * noiseScale, rowInd * noiseScale, zOff) * 360 * 4,
      ); // Since noise average is 0.5, multiplying by 4 allows angles to expand the range of possible angles to create more dynamic flow patterns
      let unitVector = p5.Vector.fromAngle(radians(angle)); // Create direction vector from angle
      flowField[colInd][rowInd] = unitVector.copy().mult(flowMagnitude);
      // text(floor(angle/4), colInd*cellSize + cellSize/2, rowInd*cellSize + cellSize/2)

      // Draw vectors
      let midPt = createVector(
        colInd * cellSize + cellSize / 2,
        rowInd * cellSize + cellSize / 2,
      );
      let endPt = midPt.copy().add(unitVector.mult(arrowLength));
      line(midPt.x, midPt.y, endPt.x, endPt.y);

      // Draw arrowhead
      let arrowSize = 4;
      push();
      translate(endPt.x, endPt.y);
      rotate(angle);
      line(0, 0, -arrowSize, arrowSize / 2);
      line(0, 0, -arrowSize, -arrowSize / 2);
      pop();
    }
  }
  zOff += zNoiseSpeed;
}

function draw() {
  background(255);
  generateFlowField();

  // Update and render particles
  for (let p = 0; p < nbParticles; p++) {
    particles[p].setNewForce(flowField);
    particles[p].updatePosition();
    particles[p].checkEdges();
    particles[p].display();
  }
}
