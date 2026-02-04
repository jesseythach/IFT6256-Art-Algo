class Particle{
    constructor(x, y){
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
    }

    display(){
        ellipse(this.position.x, this.position.y, 10);
    }

    applyForce(flowField){
        let force = flowField[floor(this.position.x/cellSize), floor(this.position.y/cellSize)];
        this.velocity = force + this.velocity
    }

    checkEdges(){

    }


}