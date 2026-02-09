class Particle {
  constructor(x, y, influenceRadius, colorProfile) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.maxVelocity = 2;
    this.prevPos = createVector(x, y);

    this.INFLUENCE_RADIUS = influenceRadius;
    this.INFLUENCE_STRENGTH = 1;
    this.INFLUENCE_SPEED_MULT = 10;
    this.influenceSpeedMult = 1;

    this.size = 3;
    this.colorProfile = colorProfile;
    this.setColorProfile(colorProfile);
  }

  setColorProfile(profile) {
    this.colorProfile = profile;
    let catWeights;
    switch (this.colorProfile) {
      case 1:
        catWeights = [0.5, 0.5];
        break;
      case 2:
        catWeights = [0.1, 1, 0.3];
        break;
      case 3:
        catWeights = [0.5, 0.5, 0.1, 0.1];
        break;
      default:
        console.warn("Invalid color profile selected:", profile);
        return;
    }

    let weightSum = catWeights.reduce((a, b) => a + b, 0);
    let ran = random(weightSum);
    let intervalStart = 0;

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
          buffer.stroke(random(260, 290), 100, 100); // Purple
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
    }

    buffer.strokeWeight(this.size);
    buffer.line(
      this.prevPos.x,
      this.prevPos.y,
      this.position.x,
      this.position.y,
    );

    this.prevPos = this.position.copy();
  }

  calculateInfluenceForce() {
    let forceToMouse = p5.Vector.sub(
      createVector(mouseX, mouseY),
      this.position,
    ); // Vector pointing from particle to mouse
    let distance = forceToMouse.mag();

    // If the particle is outside the influence radius, return zero force
    if (distance < 0 || distance > this.INFLUENCE_RADIUS) {
      this.influenceSpeedMult = 1;
      return createVector(0, 0);
    }

    let power = map(distance, 0, this.INFLUENCE_RADIUS, 1, 0);
    let mappedStrength = pow(power, 2) * this.INFLUENCE_STRENGTH;
    this.influenceSpeedMult = max(1, power * this.INFLUENCE_SPEED_MULT);

    forceToMouse.setMag(mappedStrength);

    // Check if the particle is moving towards the mouse
    let particleDir = this.velocity.copy();
    let isHeadingTowardMouse = particleDir.dot(forceToMouse) > 0; // If dot product > 0, the vectors are pointing in the same direction
    let influenceForce = forceToMouse.copy().mult(-1); // Push-back force away from the mouse

    if (isHeadingTowardMouse) {
      // Make particle deviate around mouse
      let tangent = createVector(-forceToMouse.y, forceToMouse.x); // Rotates a vector 90 degrees counterclockwise
      if (particleDir.dot(tangent) < 0) tangent.mult(-1); // If dot product > 0, the particle is moving in the counterclockwise direction like the tangent

      influenceForce.add(tangent);
    }

    influenceForce.setMag(mappedStrength);
    return influenceForce;
  }

  setNewForce(flowField, influenceEnabled) {
    let flowFieldForce =
      flowField[floor(this.position.x / cellSize)][
        floor(this.position.y / cellSize)
      ].copy();
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
    do {
      this.position.x = random(width);
      this.position.y = random(height);
    } while (
      dist(mouseX, mouseY, this.position.x, this.position.y) <=
      this.INFLUENCE_RADIUS
    );
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.prevPos = this.position.copy();
  }

  checkEdges() {
    if (this.position.x > width) {
      this.resetParticle();
    }
    if (this.position.x < 0) {
      this.resetParticle();
    }
    if (this.position.y > height) {
      this.resetParticle();
    }
    if (this.position.y < 0) {
      this.resetParticle();
    }
  }
}
