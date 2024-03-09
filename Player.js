class Player {
    constructor(size, lives) {
        this.posX;
        this.posY;
        this.size = size;
        this.lives = lives;
        this.speed = 2;
    }

    show() {
        push();
        fill(255, 0, 0);
        noStroke();
        circle(this.posX, this.posY, this.size);
        pop();
    }

    move() {
        if (keyIsDown(UP_ARROW) && this.canMove(this.posX, this.posY - this.speed)) {
            this.posY -= this.speed;
        }
        if (keyIsDown(DOWN_ARROW) && this.canMove(this.posX, this.posY + this.speed)) {
            this.posY += this.speed;
        }
        if (keyIsDown(RIGHT_ARROW) && this.canMove(this.posX + this.speed, this.posY)) {
            this.posX += this.speed;
        }
        if (keyIsDown(LEFT_ARROW) && this.canMove(this.posX - this.speed, this.posY)) {
            this.posX -= this.speed;
        }
    }

    canMove(newX, newY) {
        // This is a placeholder; you'll need collision detection with the grid
        for (let cell of grid) {
            if (grid == 1) {
                console.log("can move");
            } else {
                console.log("no");

            }
        }
        return true; // Replace with actual grid check
    }

    shoot(direction) {
        let bulletSpeed = 5; // Speed of the bullets
        let bulletDx = 0;
        let bulletDy = 0;

        // Set the direction based on the input
        if (direction.includes('w')) bulletDy = -bulletSpeed;
        if (direction.includes('s')) bulletDy = bulletSpeed;
        if (direction.includes('a')) bulletDx = -bulletSpeed;
        if (direction.includes('d')) bulletDx = bulletSpeed;

        // Add a new bullet to the bullets array
        bullets.push({ x: this.posX, y: this.posY, dx: bulletDx, dy: bulletDy });
    }

}