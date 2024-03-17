class Robot {
    constructor(mapGraph, speed) {
        this.mapGraph = mapGraph;
        this.gridPosition = null; // Initialize to null
        this.posX = 0;
        this.posY = 0;
        this.speed = speed;
        this.currentPath = [];
        this.canSeePlayer = false;
        this.size = cellSize / 1.25;
        this.isActive = true; // To control the active status of the robot
    }

    raycast(player) {
        let dx = player.posX - this.posX;
        let dy = player.posY - this.posY;
        let steps = Math.max(Math.abs(dx), Math.abs(dy));

        let xIncrement = dx / steps;
        let yIncrement = dy / steps;

        let currentX = this.posX;
        let currentY = this.posY;

        for (let i = 0; i <= steps; i++) {
            let checkX = Math.floor(currentX / cellSize);
            let checkY = Math.floor(currentY / cellSize);

            // If the cell is out of bounds or an obstacle/wall
            if (checkX < 0 || checkX >= gridSize || checkY < 0 || checkY >= gridSize ||
                grid[checkX][checkY] === 0 || grid[checkX][checkY] === 2) {
                this.canSeePlayer = false;
                return;
            }
            currentX += xIncrement;
            currentY += yIncrement;
        }

        this.canSeePlayer = true;
    }

    moveTo(nextGridX, nextGridY) {
        let targetX = nextGridX * cellSize + cellSize / 2;
        let targetY = nextGridY * cellSize + cellSize / 2;
        let diffX = targetX - this.posX;
        let diffY = targetY - this.posY;

        // Create a vector for the difference
        let diffVector = createVector(diffX, diffY);

        // Normalize and scale the vector
        let normalizedVector = this.normalize(diffVector, this.speed);

        // Apply the normalized velocity
        this.posX += normalizedVector.x * (deltaTime / 1000);
        this.posY += normalizedVector.y * (deltaTime / 1000);

        // Check if the robot has reached the target position
        if (Math.abs(this.posX - targetX) < 5 && Math.abs(this.posY - targetY) < 5) {
            this.gridPosition = [nextGridX, nextGridY];
            this.currentPath.shift(); // Move to the next point in the path
        }
    }

    normalize(vector, maxSpeed) {
        let magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (magnitude > 0) {
            return {
                x: (vector.x / magnitude) * maxSpeed,
                y: (vector.y / magnitude) * maxSpeed
            };
        }
        return { x: 0, y: 0 };
    }


    // Adapted from FamilyMember class
    findNewPath(player) {
        if (!this.isActive) return;
        let start = [Math.floor(this.posX / cellSize), Math.floor(this.posY / cellSize)];
        let goal = [Math.floor(player.posX / cellSize), Math.floor(player.posY / cellSize)];
        this.currentPath = this.findPath(this.mapGraph, start, goal);
    }

    // Modified to generate a single new random patrol point
    generatePatrolPoint() {
        let x, y;
        do {
            x = Math.floor(Math.random() * gridSize);
            y = Math.floor(Math.random() * gridSize);
        } while (!this.mapGraph.getNode(x, y) || grid[x][y] !== 1); // Ensure it is a walkable node
        return { x, y };
    }

    // Updated patrol function
    patrol() {
        if (this.currentPath.length === 0) {
            // Generate a new path to a new random patrol point
            let patrolTarget = this.generatePatrolPoint();
            this.findNewPath({ posX: patrolTarget.x * cellSize, posY: patrolTarget.y * cellSize });
        }
        if (this.currentPath.length > 0) {
            // Move towards the next point in the patrol path
            let nextPos = this.currentPath[0];
            this.moveTo(nextPos.x, nextPos.y);
        }
    }

    // This method is called whenever the robot is going to seek the player
    seekPlayer(player) {
        let playerGridPosition = [Math.floor(player.posX / cellSize), Math.floor(player.posY / cellSize)];

        // Only recalculate the path if the player has moved to a new grid position
        if (!this.gridPosition || this.gridPosition[0] !== playerGridPosition[0] || this.gridPosition[1] !== playerGridPosition[1]) {
            this.findNewPath(player);
            this.gridPosition = playerGridPosition; // Update the robot's last known position of the player
        }
    }

    update(player) {
        if (!this.isActive) return;

        // Perform raycasting to determine if the player can be seen
        this.raycast(player);


        // Recalculate path if necessary
        if (this.canSeePlayer) {
            this.seekPlayer(player);
        } else {
            this.patrol();
        }

        // Attempt to move along the current path
        if (this.currentPath.length > 0) {
            let nextPos = this.currentPath[0];
            this.moveTo(nextPos.x, nextPos.y);
        }

        this.checkForPlayerCollision(player);
    }

    checkForPlayerCollision(player) {
        const distanceToPlayer = dist(this.posX, this.posY, player.posX, player.posY);
        const collisionThreshold = this.size / 2 + player.size / 2; // Adjust as necessary

        if (distanceToPlayer < collisionThreshold) {
            player.lives -= 1; // Decrement player's lives
            this.isActive = false; // Deactivate the robot
            player.collide();

            // Optionally, handle the player's death or game over state
            if (player.lives <= 0) {
                isGameOver = true;
            }

            // Remove the robot from the robots array
            const index = robots.findIndex(robot => robot === this);
            if (index !== -1) {
                robots.splice(index, 1);
            }
        }
    }

    checkCollision(bullet) {
        let distance = dist(this.posX, this.posY, bullet.x, bullet.y);

        let collisionDistance = this.size / 2 + cellSize / 8;
        return distance < collisionDistance;
    }

    heuristic(a, b) {
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    findPath(mapGraph, start, goal) {
        // Convert array to an object with x, y properties for compatibility
        start = { x: start[0], y: start[1] };
        goal = { x: goal[0], y: goal[1] };

        let openSet = new PriorityQueue((a, b) => a.f < b.f);
        let cameFrom = new Map();
        let gScore = new Map();
        let fScore = new Map();

        gScore.set(this.positionToString(start), 0);
        fScore.set(this.positionToString(start), this.heuristic(start, goal));

        openSet.push({ x: start.x, y: start.y, f: this.heuristic(start, goal) });



        while (!openSet.isEmpty()) {
            let current = openSet.pop();


            // Check if we've reached our goal
            if (current.x === goal.x && current.y === goal.y) {
                // Reconstruct path goes here
                this.currentPath = this.reconstructPath(cameFrom, current);
                return this.reconstructPath(cameFrom, current);
            }

            // Get all valid neighbors
            let neighbors = mapGraph.getNeighbors(current.x, current.y);

            for (let neighbor of neighbors) {
                let tentativeGScore = gScore.get(this.positionToString(current)) + this.heuristic(current, neighbor);

                // If new path to neighbor is shorter or neighbor is not in openSet
                if (!gScore.has(this.positionToString(neighbor)) || tentativeGScore < gScore.get(this.positionToString(neighbor))) {
                    // Update path to this neighbor
                    cameFrom.set(this.positionToString(neighbor), current);
                    gScore.set(this.positionToString(neighbor), tentativeGScore);
                    fScore.set(this.positionToString(neighbor), tentativeGScore + this.heuristic(neighbor, goal));

                    // If neighbor is not in openSet add it
                    if (!openSet.contains(neighbor, this.positionToString)) {
                        openSet.push({ ...neighbor, f: fScore.get(this.positionToString(neighbor)) });
                    }
                }
            }
        }

        // If the loop finishes without returning, no path was found
        return [];
    }

    reconstructPath(cameFrom, current) {
        let totalPath = [current];
        while (cameFrom.has(this.positionToString(current))) {
            current = cameFrom.get(this.positionToString(current));
            totalPath.unshift(current);
        }
        totalPath.shift();
        return totalPath;
    }


    positionToString(position) {
        return `${position.x}-${position.y}`;
    }


    show() {
        // Draw the robot
        if (!this.isActive) return;

        push();
        fill(40);
        noStroke();
        rectMode(CENTER);
        square(this.posX, this.posY, this.size);
        noFill();
        stroke(255, 0, 0);
        strokeWeight(1.5);
        square(this.posX, this.posY, this.size / 1.6);
        fill(255, 0, 0);
        square(this.posX, this.posY, this.size / 3);

        pop();
        // // Draw the ray if the robot can see the player
        // if (this.isActive && this.canSeePlayer) {
        //     stroke(255, 0, 0); // Red color for the ray
        //     line(this.posX, this.posY, player.posX, player.posY);
        // }

        // // Draw the path the robot is following
        // if (this.isActive && this.currentPath && this.currentPath.length > 0) {
        //     stroke(0, 255, 0); // Green color for the path
        //     strokeWeight(2); // Set stroke weight for the path

        //     // Draw a line for the current path
        //     for (let i = 0; i < this.currentPath.length - 1; i++) {
        //         let startPoint = this.currentPath[i];
        //         let endPoint = this.currentPath[i + 1];
        //         let startX = startPoint.x * cellSize + cellSize / 2;
        //         let startY = startPoint.y * cellSize + cellSize / 2;
        //         let endX = endPoint.x * cellSize + cellSize / 2;
        //         let endY = endPoint.y * cellSize + cellSize / 2;

        //         line(startX, startY, endX, endY);
        //     }

        //     // Optionally, draw a line from the robot to the first point on the current path
        //     let nextPoint = this.currentPath[0];
        //     let nextX = nextPoint.x * cellSize + cellSize / 2;
        //     let nextY = nextPoint.y * cellSize + cellSize / 2;
        //     line(this.posX, this.posY, nextX, nextY);
        // }

        // Reset drawing settings to avoid affecting other elements
        noStroke();
        strokeWeight(1);
    }

}