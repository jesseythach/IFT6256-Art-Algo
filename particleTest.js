class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.maxVelocity = 2;
    this.size = 16;
  }

  display() {
    fill("cyan");
    ellipse(this.position.x, this.position.y, this.size);
  }

  setNewForce(flowField) {
    // Get flow field force based on particle's current position
    let force =
      flowField[floor(this.position.x / cellSize)][
        floor(this.position.y / cellSize)
      ];
    this.acceleration = force;
  }

  updatePosition() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
    this.position.add(this.velocity);
  }

  resetParticle() {
    // Place particle randomly
    this.position.x = random(width);
    this.position.y = random(height);

    // Reset motion
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
  }

  checkEdges() {
    // If particle leaves canvas, reset it
    if (this.position.x > width) this.resetParticle();
    if (this.position.x < 0) this.resetParticle();
    if (this.position.y > height) this.resetParticle();
    if (this.position.y < 0) this.resetParticle();
  }
}
