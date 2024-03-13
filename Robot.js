class Robot {
    constructor(mapGraph, speed) {
        this.mapGraph = mapGraph;
        this.gridPosition = null; // Initialize to null
        this.posX = 0;
        this.posY = 0;
        this.speed = speed;
        this.currentPath = [];
        this.patrolPoints = this.generatePatrolPoints(); // Generate initial patrol points
        this.canSeePlayer = false;
        this.size = cellSize;
        this.isActive = true; // To control the active status of the robot
    }

    // Method to check if the robot can see the player
    raycast(player) {
        // Calculate direction vector from robot to player
        let direction = { x: player.posX - this.posX, y: player.posY - this.posY };
        let distance = Math.sqrt(direction.x ** 2 + direction.y ** 2);

        // Normalize direction
        direction.x /= distance;
        direction.y /= distance;

        // Check each step along the ray for obstacles
        let steps = Math.ceil(distance / cellSize);
        for (let i = 0; i <= steps; i++) {
            let checkX = Math.floor((this.posX + direction.x * i * cellSize) / cellSize);
            let checkY = Math.floor((this.posY + direction.y * i * cellSize) / cellSize);

            // If the cell is out of bounds or an obstacle/wall, the player cannot be seen (0 == wall, 2 == obstacle)
            if (checkX < 0 || checkX >= gridSize || checkY < 0 || checkY >= gridSize || grid[checkX][checkY] === 0 || grid[checkX][checkY] === 2) {
                this.canSeePlayer = false;
                return;
            }
        }

        // If no obstacles were found, the robot can see the player
        this.canSeePlayer = true;

    }


    // Generate initial patrol points for the robot
    generatePatrolPoints() {
        let points = [];
        while (points.length < 2) {  // Assuming you want exactly 2 patrol points
            let x = Math.floor(Math.random() * gridSize);
            let y = Math.floor(Math.random() * gridSize);
            if (this.mapGraph.getNode(x, y) && grid[x][y] === 1) {  // Ensure it is a walkable node
                points.push({ x, y });
            }
        }
        return points;
    }


    // Adapted from FamilyMember class
    moveTo(nextGridX, nextGridY) {
        let targetX = nextGridX * cellSize + cellSize / 2;
        let targetY = nextGridY * cellSize + cellSize / 2;
        let diffX = targetX - this.posX;
        let diffY = targetY - this.posY;
        let distance = Math.sqrt(diffX * diffX + diffY * diffY);
        if (distance > 0) {
            let velX = (diffX / distance) * this.speed;
            let velY = (diffY / distance) * this.speed;
            this.posX += velX * (deltaTime / 1000);
            this.posY += velY * (deltaTime / 1000);
        }
        if (Math.abs(this.posX - targetX) < 5 && Math.abs(this.posY - targetY) < 5) {
            this.gridPosition = [nextGridX, nextGridY];
            this.currentPath.shift(); // Move to the next point in the path
        }
    }

    // Adapted from FamilyMember class
    findNewPath(player) {
        if (!this.isActive) return;
        let start = [Math.floor(this.posX / cellSize), Math.floor(this.posY / cellSize)];
        let goal = [Math.floor(player.posX / cellSize), Math.floor(player.posY / cellSize)];
        this.currentPath = this.findPath(this.mapGraph, start, goal);
    }

    patrol() {
        if (this.currentPath.length === 0) {
            // If no current path or reached the end, generate a new path to a random patrol point
            let patrolTarget = this.patrolPoints[Math.floor(Math.random() * this.patrolPoints.length)];
            console.log(this.patrolPoints);
            this.findNewPath({ posX: patrolTarget.x * cellSize, posY: patrolTarget.y * cellSize });
        }
        if (this.currentPath.length > 0) {
            // Move towards the next point in the patrol path
            let nextPos = this.currentPath[0];
            this.moveTo(nextPos.x, nextPos.y);
        }
    }

    seekPlayer(player) {
        this.findNewPath(player);
        if (this.currentPath.length > 0) {
            // Move towards the next point in the path to the player
            let nextPos = this.currentPath[0];
            this.moveTo(nextPos.x, nextPos.y);
        }
    }

    update(player) {
        if (!this.isActive) return;
        this.raycast(player);
        if (this.canSeePlayer) {
            this.seekPlayer(player);
        } else {
            this.patrol();
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


    show() {
        fill(255);
        circle(this.posX, this.posY, this.size);
    }
}