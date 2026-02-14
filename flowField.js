// Canvas
const margin = 2;
let pg;

// Flow field 
let cols;
let rows;
let cellSize = 50;
let noiseScale = 0.02;
let zOff = 0;
let zNoiseSpeed = 0.001;
let flowField = [];
let flowMagnitude = 0.1;
let arrowLength = cellSize / 2;

// Particles
let particles = [];
let nbParticles = 10000;

// Influence
let influenceRadius = 200;

// Interactions
let isPlaying = false;
let showTitle = false;
let influenceEnabled = false;

// Colors and fonts
let colorProfile = 1;
let titleFont;
let palette = {
  influence: null,
  title: null
};

// ================================= Canvas =================================

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

  // Create an "offscreen drawing canvas (graphics buffer)" for particles
  pg = createGraphics(canvasWidth, canvasHeight); 
  pg.colorMode(HSB);
  pg.background(0);

  cols = ceil(width / cellSize);
  rows = ceil(height / cellSize);
  angleMode(DEGREES);
  colorMode(HSB);
  noCursor();
}

// ================================= Colors =================================

function changeColorProfile(newProfile) {
  colorProfile = newProfile;
  if (!isPlaying) return;

  for (let i = 0; i < nbParticles; i++) {
    particles[i].setColorProfile(colorProfile);
  }
}

function setColors() {
  switch (colorProfile) {
    case 1:
      palette.influence = color(180, 100, 100); // Blue
      palette.title = color(180, 100, 100);
      break;

    case 2:
      palette.influence = color(0, 0, 100); // White
      palette.title = color(0, 0, 100);
      break;

    case 3:
      palette.influence = color(50, 100, 100); // Yellow
      palette.title = color(50, 100, 100);
      break;
  }
}

// ================================= Draw =================================

function computeFlowField() {
  for (let colInd = 0; colInd < cols; colInd++) {
    flowField[colInd] = [];
    for (let rowInd = 0; rowInd < rows; rowInd++) {
      // Create angle based on Perlin noise at each cell
      let angle = int(
        noise(colInd * noiseScale, rowInd * noiseScale, zOff) * 360 * 4,
      ); // Since noise average is 0.5, multiplying by 4 allows angles to expand the range of possible angles to create more dynamic flow patterns
      let unitVector = p5.Vector.fromAngle(radians(angle)); // Create direction vector from angle
      flowField[colInd][rowInd] = unitVector.copy().mult(flowMagnitude);
    }
  }
  zOff += zNoiseSpeed; // Increment the z-offset to create evolving noise over time
}

function drawInfluence() {
  noFill();
  ellipseMode(CENTER);

  // Add glow effect around influence
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = palette.influence;

  stroke(palette.influence);
  strokeWeight(8);
  
  // Draw multiple overlapping ellipses to enhance the glow effect
  for (let i = 0; i < 5; i++) {
    ellipse(mouseX, mouseY, influenceRadius * 0.75);
  }
  drawingContext.shadowBlur = 0;
}

function preload() {
  // titleFont = loadFont('assets/BitcountGridDouble-VariableFont_CRSV,ELSH,ELXP,slnt,wght.ttf');
  titleFont = loadFont("assets/Exo2-VariableFont_wght.ttf");
  // titleFont = loadFont('assets/RubikLines-Regular.ttf');
}

function drawTitle() {
  pg.push();
  let titleSize = min(width, height) * 0.07; 
  pg.fill(palette.title, 10); 
  pg.noStroke();
  pg.textFont(titleFont);
  pg.textSize(titleSize);
  pg.textAlign(CENTER, CENTER);
  pg.textLeading(titleSize);
  pg.text("Where Life Persists", width / 2, height / 2);
  pg.pop();
}

function draw() {
  background(0); // Clear the main canvas to prevent trails 
  pg.background(0, 0.03); // Clear the offscreen canvas to create fading trails
  setColors(); 

  if (showTitle) {
    drawTitle();
  }

  computeFlowField(); // Recompute flow field for dynamic movement

  // Update and render particles
  for (let p = 0; p < particles.length; p++) {
    particles[p].setNewForce(flowField, influenceEnabled);
    particles[p].updatePosition();
    particles[p].checkEdges();
    particles[p].display(pg);
  }
  image(pg, 0, 0); // Draw the offscreen canvas onto the main canvas

  if (influenceEnabled) {
    drawInfluence();
  }
}

// ================================= Interactions =================================

function keyPressed() {
  // Play/pause particles from moving with space key
  if (keyCode === 32 && isPlaying) {
    // Only pause or unpause if particles are actually moving
    if (isLooping()) {
      noLoop();
    } else {
      loop();
    }
  }

  if (!isLooping()) return; // Don't allow other interactions if paused

  // Spawn/clear particles with key 'S'
  if (keyCode === 83) {
    if (!isPlaying) {
      for (let i = 0; i < nbParticles; i++) {
        particles[i] = new Particle(random(width), random(height), influenceRadius, colorProfile);
      }
      isPlaying = true;
    } else {
      isPlaying = false;
      particles = [];
    }
  }

  // Show/hide title with key 'T'
  if (keyCode === 84) {
    showTitle = !showTitle;
  }

  // Enable/disable influence with key 'I'
  if (keyCode === 73) {
    influenceEnabled = !influenceEnabled;
  }

  // Change color profile with keys 1, 2, and 3
  if (keyCode === 49) {
    changeColorProfile(1);
  } else if (keyCode === 50) {
    changeColorProfile(2);
  } else if (keyCode === 51) {
    changeColorProfile(3);
  }
}
