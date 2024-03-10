class Player {
    constructor(size, lives) {
        this.posX;
        this.posY;
        this.size = size;
        this.lives = lives;
        this.speed = 100;
    }

    show() {
        push();
        fill(255, 0, 0);
        noStroke();
        circle(this.posX, this.posY, this.size);
        pop();
    }

    move() {
        const speedPerFrame = this.speed * (deltaTime / 1000); // Convert speed to per-frame movement


        if (keyIsDown(UP_ARROW) && this.canMove(this.posX, this.posY - speedPerFrame)) {
            this.posY -= speedPerFrame;
        }
        if (keyIsDown(DOWN_ARROW) && this.canMove(this.posX, this.posY + speedPerFrame)) {
            this.posY += speedPerFrame;
        }
        if (keyIsDown(RIGHT_ARROW) && this.canMove(this.posX + speedPerFrame, this.posY)) {
            this.posX += speedPerFrame;
        }
        if (keyIsDown(LEFT_ARROW) && this.canMove(this.posX - speedPerFrame, this.posY)) {
            this.posX -= speedPerFrame;
        }
    }

    // Check if the new position is a valid move
    canMove(newX, newY) {
        // Adjust the positions to account for the radius of the player circle
        let leftEdge = newX - this.size / 2;
        let rightEdge = newX + this.size / 2;
        let topEdge = newY - this.size / 2;
        let bottomEdge = newY + this.size / 2;

        // Convert pixel coordinates back to grid index
        let gridLeft = Math.floor(leftEdge / cellSize);
        let gridRight = Math.floor(rightEdge / cellSize);
        let gridTop = Math.floor(topEdge / cellSize);
        let gridBottom = Math.floor(bottomEdge / cellSize);

        // Check if any edge of the player circle is outside the grid bounds
        if (gridLeft < 0 || gridRight >= gridSize || gridTop < 0 || gridBottom >= gridSize) {
            return false; // New position is out of bounds
        }

        // Check if the cells in the grid at the edges of the player circle are walkable
        // You may need to check more cells here if your grid cell size is smaller than the player size
        return (
            grid[gridLeft][gridTop] === 1 &&
            grid[gridRight][gridTop] === 1 &&
            grid[gridLeft][gridBottom] === 1 &&
            grid[gridRight][gridBottom] === 1
        );
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