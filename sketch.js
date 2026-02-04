let cols;
let rows;
let cellSize = 50;
let noiseScale = 0.02; // check later
let zOff = 0;
let zNoiseSpeed = 0.001;
let flowField = [];

let arrowLength = 25;

let avgFPS = 0;
let lastFPSImportance = 0.2;

function setup() {
  createCanvas(800, 500);
  cols = int(width / cellSize);
  rows = int(height / cellSize);
  fr = createP("");
  angleMode(DEGREES);
  colorMode(HSB);
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
      // noFill();
      // noStroke();
      rect(colInd * cellSize, rowInd * cellSize, cellSize, cellSize);

      flowField[colInd][rowInd] = p5.Vector.fromAngle(radians(angle));
      //text(angle, colInd*cellSize + cellSize/2, rowInd*cellSize + cellSize/2)

      let midPt = createVector(
        colInd * cellSize + cellSize / 2,
        rowInd * cellSize + cellSize / 2,
      );
      let endPt = midPt.copy().add(flowField[colInd][rowInd].mult(arrowLength));
      line(midPt.x, midPt.y, endPt.x, endPt.y);
    }
  }
  zOff += zNoiseSpeed;
}

function draw() {
  //noLoop()
  background(255);

  computeFlowField();

  let p = new Particle(random(width), random(height));
  p.display();
  p.applyForce(flowField);
 
  avgFPS = floor(
    avgFPS * (1 - lastFPSImportance) + frameRate() * lastFPSImportance,
  );
  fr.html(avgFPS);
  // console.log(avgFPS);
}
