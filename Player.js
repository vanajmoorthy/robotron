class Player {
    constructor(lives) {
        this.gridPosition;
        this.posX;
        this.posY;
        this.size = cellSize - 10;
        this.lives = lives;
        this.speed = 100;
        this.hitTime = 0;          // Time since the player was hit
        this.hitDuration = 500;   // Duration of hit effect in milliseconds
        this.isHit = false;        // Is the player currently hit
    }


    show() {
        push();
        if (this.isHit) {
            // Change color to red if hit
            fill(255, 0, 0);
        } else {
            // Original color
            fill(79, 79, 79);

        }
        noStroke();
        circle(this.posX, this.posY, this.size);
        pop();
    }

    collide() {
        this.isHit = true;
        this.hitTime = millis();
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

        let moved = false; // Track if the player has moved

        if (keyIsDown(UP_ARROW) && this.canMove(this.posX, this.posY - speedPerFrame)) {
            this.posY -= speedPerFrame;
            moved = true;
        }
        if (keyIsDown(DOWN_ARROW) && this.canMove(this.posX, this.posY + speedPerFrame)) {
            this.posY += speedPerFrame;
            moved = true;
        }
        if (keyIsDown(RIGHT_ARROW) && this.canMove(this.posX + speedPerFrame, this.posY)) {
            this.posX += speedPerFrame;
            moved = true;
        }
        if (keyIsDown(LEFT_ARROW) && this.canMove(this.posX - speedPerFrame, this.posY)) {
            this.posX -= speedPerFrame;
            moved = true;
        }

        if (moved) {
            // Update gridPosition after moving
            this.updateGridPosition();
        }
    }

    updateGridPosition() {
        // Convert pixel coordinates to grid index and update gridPosition
        this.gridPosition[0] = Math.floor(this.posX / cellSize);
        this.gridPosition[1] = Math.floor(this.posY / cellSize);
    }

    update() {
        // Call this method in the draw function to keep updating the player state
        if (this.isHit && millis() - this.hitTime > this.hitDuration) {
            this.isHit = false;
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