class Player {
    constructor(lives, speed) {
        this.gridPosition;
        this.posX;
        this.posY;
        this.size = cellSize - 10;
        this.lives = lives;
        this.speed = speed;
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
        noFill();
        strokeWeight(1.5);
        stroke(255);
        circle(this.posX, this.posY, this.size / 1.5);

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
        // console.log("player grid position: ", this.gridPosition);
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
        let gridRight = Math.ceil(rightEdge / cellSize) - 1; // Adjusted to ensure we check the correct grid cells
        let gridTop = Math.floor(topEdge / cellSize);
        let gridBottom = Math.ceil(bottomEdge / cellSize) - 1; // Adjusted similarly

        // Check if any edge of the player circle is outside the grid bounds
        if (gridLeft < 0 || gridRight >= gridSize || gridTop < 0 || gridBottom >= gridSize) {
            return false; // New position is out of bounds
        }

        // Check if the cells in the grid at the edges of the player circle are walkable
        for (let x = gridLeft; x <= gridRight; x++) {
            for (let y = gridTop; y <= gridBottom; y++) {
                // Allow movement if the cell is walkable or is an obstacle that can be passed through
                if (!(grid[x][y] === 1 || grid[x][y] === 2)) {
                    return false; // Block movement if any part of the player would move into an unwalkable cell
                }
            }
        }
        return true; // Movement is allowed
    }


    shoot(direction) {
        let bulletSpeed = cellSize / 2; // Speed of the bullets
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