
class FamilyMember {
    constructor(maxSpeed, type) {
        this.gridPosition; // Initialize with a default value
        this.posX = 0; // Initialize with a default value
        this.posY = 0; // Initialize with a default value
        this.velX = 0;
        this.velY = 0;
        this.maxSpeed = maxSpeed;
        this.size = cellSize / 1.25;
        this.currentPath = [];
        this.type = type;
        this.color;
        this.points;
        this.setType();
        this.isActive = true;
        this.isFleeingFromRobots = false;
        this.fleeingRadius = cellSize * 3;
        this.lastRobotGridPosition = undefined;
    }

    // Display the family member on the canvas
    show() {
        if (!this.isActive) {
            return;
        }

        push();
        fill(this.color[0], this.color[1], this.color[2], 255);
        noStroke();
        circle(this.posX, this.posY, this.size);
        pop();

        // // If isFleeingFromRobots is true or drawFleeingRadius is true, draw the fleeing radius
        // if (this.isFleeingFromRobots) {
        //     push();
        //     stroke(255, 0, 0);
        //     noFill();
        //     ellipse(this.posX, this.posY, this.fleeingRadius * 2); // The radius is doubled for diameter
        //     pop();
        // }

        // // Draw the current path if it exists
        // if (this.currentPath && this.currentPath.length > 1) {
        //     push();
        //     stroke(0, 255, 0); // Set the path color
        //     strokeWeight(2); // Set the path line thickness
        //     noFill();
        //     beginShape();
        //     for (let i = 0; i < this.currentPath.length; i++) {
        //         let pathPoint = this.currentPath[i];
        //         vertex(pathPoint.x * cellSize + cellSize / 2, pathPoint.y * cellSize + cellSize / 2);
        //     }
        //     endShape();
        //     pop();
        // }
    }

    setType() {
        if (this.type === 'mother') {
            this.points = 50;
            this.color = [235, 52, 201];
        } else if (this.type === 'father') {
            this.points = 50;
            this.color = [87, 179, 57];
        } else if (this.type === 'sibling') {
            this.points = 35;
            this.color = [12, 132, 237];
        } else {
            console.log("Invalid family member type");
        }
    }

    update(mapGraph, robots) {
        if (!this.isActive) {
            return;
        }
        const fleeThreshold = this.fleeingRadius;

        this.isFleeingFromRobots = this.fleeFromRobots(mapGraph, robots, fleeThreshold);

        // console.log("robots: ", robots);
        if (this.isFleeingFromRobots) {
            // If fleeing, move along the current path
            if (this.currentPath.length > 1) {
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
            }
        } else {

            // Not fleeing, follow the normal path to the player
            if (player.gridPosition[0] !== lastPlayerGridPosition[0] || player.gridPosition[1] !== lastPlayerGridPosition[1]) {
                // Player has moved, find a new path to the player's position
                this.findNewPath(mapGraph, player.gridPosition);

                // Update the last known player position
                lastPlayerGridPosition = player.gridPosition.slice();
            }

            if (obstacleRemovedFlag) {
                this.findNewPath(mapGraph, player.gridPosition);
                obstacleRemovedFlag = false; // Reset the flag
            }

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
                this.findNewPath(mapGraph, player.gridPosition);
            }
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
        this.updateGridPosition();
    }

    updateGridPosition() {
        // Convert the current pixel position back to grid coordinates
        this.gridPosition = [Math.floor(this.posX / cellSize), Math.floor(this.posY / cellSize)];
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
        if (!this.isActive) {
            return;
        }
        let dx = this.posX - player.posX;
        let dy = this.posY - player.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Simple circle collision detection
        return distance < (this.size / 2 + player.size / 2);

    }

    fleeFromRobots(mapGraph, robots, fleeThreshold) {
        let closestRobot = null;
        let closestDistance = Infinity;

        // Find the closest robot
        for (let robot of robots) {
            if (!robot.isActive) continue;
            let d = this.heuristic({ x: this.posX, y: this.posY }, { x: robot.posX, y: robot.posY });
            if (d < closestDistance) {
                closestDistance = d;
                closestRobot = robot;
            }
        }

        if (closestRobot && closestDistance < fleeThreshold && (!this.isFleeingFromRobots)) {
            let robotGridPosition = [Math.floor(closestRobot.posX / cellSize), Math.floor(closestRobot.posY / cellSize)];

            let shouldRecalculatePath = this.lastRobotGridPosition === undefined ||
                this.lastRobotGridPosition[0] !== robotGridPosition[0] ||
                this.lastRobotGridPosition[1] !== robotGridPosition[1] ||
                this.currentPath.length === 0;

            console.log("should: ", shouldRecalculatePath);
            console.log("last robot pos: ", this.lastRobotGridPosition);
            console.log("curr robot pos: ", robotGridPosition);
            console.log("path: ", this.currentPath);



            if (!shouldRecalculatePath) {
                return;
            }

            let possibleFleePoints = []; // Initialize an empty array to store valid flee points


            // Calculate the direction vector from the robot to the family member
            let directionX = this.gridPosition[0] - robotGridPosition[0];
            let directionY = this.gridPosition[1] - robotGridPosition[1];

            // Normalize the direction vector
            let magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
            directionX = magnitude > 0 ? directionX / magnitude : 0;
            directionY = magnitude > 0 ? directionY / magnitude : 0;


            let bestFleePoint = null;
            let maxDistance = -Infinity;

            for (let neighbor of mapGraph.getNeighbors(this.gridPosition[0], this.gridPosition[1])) {
                if (!this.isCellValid(neighbor.x, neighbor.y)) continue;

                let neighborDirectionX = neighbor.x - this.gridPosition[0];
                let neighborDirectionY = neighbor.y - this.gridPosition[1];

                // Calculate how aligned the neighbor is with the direction we want to go
                let dotProduct = neighborDirectionX * (directionX) + neighborDirectionY * (directionY);
                if (dotProduct > maxDistance) {
                    maxDistance = dotProduct;
                    bestFleePoint = neighbor;
                }
            }

            // Choose a random point from the possible flee points (if any)
            if (bestFleePoint) {
                this.findNewPath(mapGraph, [bestFleePoint.x, bestFleePoint.y]);
                this.lastRobotGridPosition = robotGridPosition; // Update the last robot grid position
                // let randomFleePoint = possibleFleePoints[Math.floor(Math.random() * possibleFleePoints.length)];
                // Update the family member's path using the existing function
                // this.findNewPath(mapGraph, [randomFleePoint.x, randomFleePoint.y]);
                this.isFleeingFromRobots = true;


            } else {
                // No valid flee points, might need alternative fleeing behavior
                // (e.g., move closer to a valid point)
                console.log("No valid flee point found, staying in place or handling differently");
                this.isFleeingFromRobots = false;
            }
        } else {
            // Robot is not close, stop fleeing

            this.isFleeingFromRobots = false;
        }

        return this.isFleeingFromRobots;
    }





    isCellValid(x, y) {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize && grid[x][y] === 1;
    }



}
