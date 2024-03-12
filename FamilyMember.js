class FamilyMember {
    constructor(maxSpeed, maxAcceleration) {
        this.gridPosition; // Initialize with a default value
        this.posX = 0; // Initialize with a default value
        this.posY = 0; // Initialize with a default value
        this.velX = 0;
        this.velY = 0;
        this.maxSpeed = maxSpeed;
        this.maxAcceleration = maxAcceleration;
        this.size = cellSize;
        this.currentPath = [];
    }
    // Display the family member on the canvas
    show() {
        push();
        fill(0, 255, 0, 255); // Changed color to green for distinction
        noStroke();
        circle(this.posX, this.posY, this.size);
        pop();
    }

    update(mapGraph) {
        // Ensure there's a goal and a path to follow
        let goal = player.gridPosition;
        console.log(goal);
        if (this.currentPath.length > 1) {
            // The next position to move towards is the second item in the path
            // (the first item is the current position)
            let nextPos = this.currentPath[1];
            this.moveTo(nextPos.x, nextPos.y);

            // Move based on velocity and deltaTime
            let delta = deltaTime / 1000; // Convert to seconds
            this.posX += this.velX * delta;
            this.posY += this.velY * delta;

            // Determine if the FamilyMember has reached the next position
            let reachedX = Math.abs(nextPos.x * cellSize + cellSize / 2 - this.posX) < (this.maxSpeed * delta);
            let reachedY = Math.abs(nextPos.y * cellSize + cellSize / 2 - this.posY) < (this.maxSpeed * delta);
            if (reachedX && reachedY) {
                // Update current position to the next position
                this.posX = nextPos.x * cellSize + cellSize / 2;
                this.posY = nextPos.y * cellSize + cellSize / 2;

                // Remove the reached position from the path, making the next segment the current target
                this.currentPath.shift();
            }
        } else {
            // Find a new path if there's none or we've reached the end of the current path
            this.findNewPath(mapGraph, goal);
        }
    }

    findNewPath(mapGraph, goal) {
        let start = [Math.floor(this.posX / cellSize), Math.floor(this.posY / cellSize)];
        this.currentPath = this.findPath(mapGraph, start, goal);
        // Check if the path leads to the goal and handle accordingly
        if (this.currentPath.length <= 1) {
            this.reachedTarget = true; // Target reached or no path found
            this.velX = 0; // Stop movement
            this.velY = 0;
        } else {
            this.reachedTarget = false;
        }
    }


    moveTo(nextGridX, nextGridY) {
        // Calculate the center of the next cell in pixels
        let targetX = nextGridX * cellSize + cellSize / 2;
        let targetY = nextGridY * cellSize + cellSize / 2;

        // Calculate the vector from the current position to the target position
        let diffX = targetX - this.posX;
        let diffY = targetY - this.posY;

        // Normalize the velocity and scale it to max speed
        let desiredVelocity = this.normalize({ x: diffX, y: diffY }, this.maxSpeed);

        // Set the family member's velocity towards the target
        this.velX = desiredVelocity.x;
        this.velY = desiredVelocity.y;
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
        return totalPath;
    }


    positionToString(position) {
        return `${position.x}-${position.y}`;
    }


    // Check for collision with the player
    checkCollision(player) {
        let dx = this.posX - player.posX;
        let dy = this.posY - player.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Simple circle collision detection
        return distance < (this.size / 2 + player.size / 2);
    }
}
