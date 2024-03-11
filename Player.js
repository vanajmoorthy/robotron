class Player {
    constructor() {
        this.posX;
        this.posY;
        this.size = cellSize - 10;
        this.lives = 5;
        this.speed = 100;
        this.gridPosition;
    }

    show() {
        push();
        fill(14, 125, 230);
        noStroke();
        circle(this.posX, this.posY, this.size);
        pop();
    }

    checkCollision(obstacle) {
        let dx = this.posX - obstacle.posX;
        let dy = this.posY - obstacle.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Check if the distance between player and obstacle centers is less than their combined radii
        return distance < (this.size / 2 + obstacle.size / 2);
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
        let bulletSpeed = 20; // Speed of the bullets
        let bulletDx = 0;
        let bulletDy = 0;
        const diagSpeed = bulletSpeed / Math.sqrt(2); // Speed for diagonal movement

        // Determine horizontal and vertical directions
        if (direction.includes('w')) bulletDy = -diagSpeed;
        if (direction.includes('s')) bulletDy = diagSpeed;
        if (direction.includes('a')) bulletDx = -diagSpeed;
        if (direction.includes('d')) bulletDx = diagSpeed;

        // Add a new bullet to the bullets array
        bullets.push({ x: this.posX, y: this.posY, dx: bulletDx, dy: bulletDy, speed: bulletSpeed });
    }
}