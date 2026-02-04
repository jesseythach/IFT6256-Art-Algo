class Particle{
    constructor(x, y){
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.maxVelocity = 2;

        this.size = 3;
        this.JesseysIdea = random(1) < 0.5;
    }

    display(){
        noStroke();
        if (this.JesseysIdea) {
            fill(90, 100, 100);
        } else {
            fill(random(140, 220), 100, 100);
        }
        ellipse(this.position.x, this.position.y, this.size);
    }

    setNewForce(flowField){
        let force = flowField[floor(this.position.x/cellSize)][floor(this.position.y/cellSize)];
        this.acceleration = force;
    }
    
    updatePosition() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxVelocity);
        this.position.add(this.velocity);
    }

    checkEdges(){
        if (this.position.x > width) { 
            this.position.x = random(width);
            this.position.y = random(height);
            this.velocity = createVector(0,0);
            this.acceleration = createVector(0,0);
        }
        if (this.position.x < 0) { 
            this.position.x = random(width);
            this.position.y = random(height);
            this.velocity = createVector(0,0);
            this.acceleration = createVector(0,0);
        }
        if (this.position.y > height) { 
            this.position.x = random(width);
            this.position.y = random(height);
            this.velocity = createVector(0,0);
            this.acceleration = createVector(0,0);
        }
        if (this.position.y < 0) { 
            this.position.x = random(width);
            this.position.y = random(height);
            this.velocity = createVector(0,0);
            this.acceleration = createVector(0,0);
        }
    }
}