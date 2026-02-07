class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.maxVelocity = 2;
    this.prevPos = createVector(x, y);
    this.INFLUENCE_RADIUS = 200;
    this.INFLUENCE_STRENGTH = 1;
    this.isInsideInfluence = false;

    this.size = 3;
    this.colorCategory = floor(random(0.7, 2.3)); //0, 1 or 2
  }

  display(buffer) {
    // if (this.JesseysIdea) {
    //   buffer.stroke(90, 100, 100);
    // } else {
    //   buffer.stroke(random(140, 220), 100, 100);
    // }

    if (this.colorCategory == 0) {
      buffer.stroke(0, 0, 100);
    } else if (this.colorCategory == 1) {
      buffer.stroke(random(260, 290), 100, 100);
    } else {
      buffer.stroke(210, 60, 100);
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
    let force = p5.Vector.sub(createVector(mouseX, mouseY), this.position);
    let distance = force.mag();

    if (distance > 0 && distance < this.INFLUENCE_RADIUS) {
      this.isInsideInfluence = true;
      let power = map(distance, 0, this.INFLUENCE_RADIUS, 1, 0);
      let mappedStrength = pow(power, 2) * this.INFLUENCE_STRENGTH;

      // Repulsion
      force.mult(-1);
      force.setMag(mappedStrength);

      return force;
    }
    this.isInsideInfluence = false;
    return createVector(0, 0); // No force if outside influence
  }

  setNewForce(flowField) {
    let flowFieldForce =
      flowField[floor(this.position.x / cellSize)][
        floor(this.position.y / cellSize)
      ].copy();
    let influenceForce = this.calculateInfluenceForce();
    this.acceleration = flowFieldForce.add(influenceForce);
  }

  updatePosition() {
    this.velocity.add(this.acceleration);
    if (this.isInsideInfluence) {
      this.velocity.limit(this.maxVelocity * 5);
    } else {
      this.velocity.limit(this.maxVelocity);
    }
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
