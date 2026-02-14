class Particle {
  constructor(x, y, influenceRadius, colorProfile) {
    // Motion properties
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.maxVelocity = 2;
    this.prevPos = createVector(x, y);

    // Influence properties
    this.INFLUENCE_RADIUS = influenceRadius;
    this.INFLUENCE_STRENGTH = 1;
    this.INFLUENCE_SPEED_MULT = 10;
    this.influenceSpeedMult = 1;

    // Visual properties
    this.size = 3;
    this.colorProfile = colorProfile;
    this.setColorProfile(colorProfile);
  }

  // ================================= Visuals =================================

  setColorProfile(profile) {
    this.colorProfile = profile;
    let catWeights;
    switch (this.colorProfile) {
      case 1:
        catWeights = [0.5, 0.5]; // Green and Blue
        break;
      case 2:
        catWeights = [0.1, 0.7, 0.5]; // White, Purple, and Blue
        break;
      case 3:
        catWeights = [0.5, 0.5, 0.1, 0.1]; // Red, Orange, Pink, and Yellow
        break;
      case 4:
        catWeights = [0.5, 0.7, 0.5, 0.2]; // Orange, Blue, Dark Blue, and Yellow
        break;
      default:
        console.warn("Invalid color profile selected:", profile);
        return;
    }

    // Randomly assign color category using weighted probabilities
    let weightSum = catWeights.reduce((a, b) => a + b, 0);
    let ran = random(weightSum);
    let intervalStart = 0;

    // Determine which category the random number falls into
    for (let category = 0; category < catWeights.length; category++) {
      if (ran >= intervalStart && ran <= intervalStart + catWeights[category]) {
        this.colorCategory = category + 1;
        break;
      } else {
        intervalStart += catWeights[category];
      }
    }
  }

  display(buffer) {
    // Select color depending on profile and category
    switch (this.colorProfile) {
      case 1:
        if (this.colorCategory == 1) {
          buffer.stroke(90, 100, 100); // Green
        } else {
          buffer.stroke(random(140, 220), 100, 100); // Blue
        }
        break;
      case 2:
        if (this.colorCategory == 1) {
          buffer.stroke(0, 0, 100); // White
        } else if (this.colorCategory == 2) {
          buffer.stroke(242, 58, 88); // Purple
        } else {
          buffer.stroke(210, 60, 100); // Blue
        }
        break;
      case 3:
        if (this.colorCategory == 1) {
          buffer.stroke(0, 80, 100); // Red
        } else if (this.colorCategory == 2) {
          buffer.stroke(28, 100, 100); // Orange
        } else if (this.colorCategory == 3) {
          buffer.stroke(338, 78, 100); // Pink
        } else {
          buffer.stroke(40, 80, 90); // Yellow
        }
        break;
      case 4:
        if (this.colorCategory == 1) {
          buffer.stroke(39, 93, 82); // Orange
        } else if (this.colorCategory == 2) {
          buffer.stroke(210, 76, 92); // Blue
        } else if (this.colorCategory == 3) {
          buffer.stroke(235, 61, 50); // Dark Blue
        } else {
          buffer.stroke(40, 99, 96); // Yellow
        }
        break;
    }

    buffer.strokeWeight(this.size);
    // Draw motion trail between previous and current position
    buffer.line(
      this.prevPos.x,
      this.prevPos.y,
      this.position.x,
      this.position.y,
    );
    this.prevPos = this.position.copy();
  }

  // ================================= Physics =================================

  calculateInfluenceForce() {
    // Vector pointing from particle to mouse
    let forceToMouse = p5.Vector.sub(
      createVector(mouseX, mouseY),
      this.position,
    );
    let distance = forceToMouse.mag();

    // If the particle is outside of the influence radius, no force is applied
    if (distance < 0 || distance > this.INFLUENCE_RADIUS) {
      this.influenceSpeedMult = 1;
      return createVector(0, 0);
    }

    let power = map(distance, 0, this.INFLUENCE_RADIUS, 1, 0); // Closer to mouse, stronger the force
    let mappedStrength = pow(power, 2) * this.INFLUENCE_STRENGTH; // Quadratic falloff for stronger influence (actual force magnitude)
    this.influenceSpeedMult = max(1, power * this.INFLUENCE_SPEED_MULT); // Increase particle speed near mouse
    forceToMouse.setMag(mappedStrength);

    // Determine if the particle is moving towards the mouse
    let particleDir = this.velocity.copy(); // Current direction of the particle
    let isHeadingToMouse = particleDir.dot(forceToMouse) > 0; // If dot product > 0, the vectors are pointing in the same direction
    let influenceForce = forceToMouse.copy().mult(-1); // Default influence pushes particle away from mouse

    if (isHeadingToMouse) {
      // Make particle deviate around mouse
      let tangent = createVector(-forceToMouse.y, forceToMouse.x); // Rotates a vector 90 degrees counterclockwise
      if (particleDir.dot(tangent) < 0) tangent.mult(-1); // If dot product > 0, the particle is moving in the clockwise direction like the tangent
      influenceForce.add(tangent);
    }

    influenceForce.setMag(mappedStrength);
    return influenceForce;
  }

  setNewForce(flowField, influenceEnabled) {
    // Get flow field force based on particle's current position
    let flowFieldForce =
      flowField[floor(this.position.x / cellSize)][
        floor(this.position.y / cellSize)
      ].copy();

    // Combine flow force with mouse influence if enabled
    if (influenceEnabled) {
      let influenceForce = this.calculateInfluenceForce();
      this.acceleration = flowFieldForce.add(influenceForce);
    } else {
      this.acceleration = flowFieldForce;
    }
  }

  updatePosition() {
    this.velocity.mult(0.96); // Damping for smoother movement
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity * this.influenceSpeedMult);
    this.position.add(this.velocity);
  }

  resetParticle() {
    // Place particle randomly outside the influence radius
    do {
      this.position.x = random(width);
      this.position.y = random(height);
    } while (
      dist(mouseX, mouseY, this.position.x, this.position.y) <=
      this.INFLUENCE_RADIUS
    );

    // Reset motion
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);

    // Reset trail starting point
    this.prevPos = this.position.copy();
  }

  checkEdges() {
    // If particle leaves canvas, reset it
    if (this.position.x > width) this.resetParticle();
    if (this.position.x < 0) this.resetParticle();
    if (this.position.y > height) this.resetParticle();
    if (this.position.y < 0) this.resetParticle();
  }
}
