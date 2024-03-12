// Global variables
let windowSize;            // To store the size of the window for the canvas
let grid;                  // The grid that will represent our dungeon map
const gridSize = 25;       // The size of the grid (25x25 in this case)
const roomCount = 5;       // The number of rooms to generate
const maxRoomSize = 15;    // The maximum size of a room
const rooms = [];          // An array to store the room objects

let cellSize; // Calculate the size of each grid cell
let bullets = [];

let player;
let mapGraph;

let canShoot = false;

let numberOfObstacles = gridSize / 2;

let obstacles = [];

let isGameOver = false;

let excludedPositions = [];
let familyMembers = [];

let numberOfFamilyMembers = 5;


function setup() {
    mapGraph = new Graph();

    // Calculate the window size, leaving some margin
    windowSize = min(windowHeight, windowWidth) - 30;
    cellSize = (windowSize / gridSize);

    // Set up the canvas with the computed window size
    createCanvas(windowSize, windowSize);

    // Initialize the grid
    grid = makeGrid(gridSize);

    // Initialize the player 
    player = new Player();

    // Generate rooms and place them on the grid
    generateRooms(roomCount);

    // Connect the rooms with corridors
    connectRooms();
    refillAdjacentDiagonals(grid);

    buildGraph();

    placeObject(mapGraph, player, [], false);

    excludedPositions = [player.gridPosition];

    // Call this function after pruning
    if (!isConnected(mapGraph)) {
        console.log('The graph is not fully connected after pruning.');
        // Handle the disconnected graph, e.g., by re-generating or reconnecting it
    } else {
        console.log("fully connected");
    }

    generateObstacles(numberOfObstacles, mapGraph, excludedPositions);


    pruneGraph(mapGraph, obstacles);
    generateFamilyMembers(mapGraph, numberOfFamilyMembers);




}

function isConnected(graph) {
    let visited = new Set();
    let nodes = Object.values(graph.nodes);

    // Start BFS from the first node in the graph
    let queue = [nodes[0]];

    while (queue.length > 0) {
        let node = queue.shift();

        // If we've already visited this node, skip it
        if (visited.has(node)) {
            continue;
        }

        // Mark the node as visited
        visited.add(node);

        // Add all unvisited adjacent nodes to the queue
        for (let adjacent of node.adjacent) {
            if (!visited.has(adjacent)) {
                queue.push(adjacent);
            }
        }
    }

    // The graph is connected if we've visited all nodes
    return visited.size === nodes.length;
}


function generateFamilyMembers(graph, numberOfFamilyMembers) {
    for (let i = 0; i < numberOfFamilyMembers; i++) {
        familyMembers.push(new FamilyMember(100, 1));
        placeObject(graph, familyMembers[i], excludedPositions, true);
    }
}

function drawPath(path) {
    if (path && path.length > 0) {
        // Set the stroke to visually distinguish the path, e.g., red color
        stroke(255, 0, 0);
        strokeWeight(2); // Set the thickness of the path line

        for (let i = 0; i < path.length - 1; i++) {
            // Convert grid coordinates to pixel coordinates
            let startX = path[i].x * cellSize + cellSize / 2;
            let startY = path[i].y * cellSize + cellSize / 2;
            let endX = path[i + 1].x * cellSize + cellSize / 2;
            let endY = path[i + 1].y * cellSize + cellSize / 2;

            // Draw a line segment between each pair of points on the path
            line(startX, startY, endX, endY);
        }

        // Reset stroke weight after drawing the path
        strokeWeight(0.5);
    }
}

// Function to draw the graph on the canvas
function drawGraph(graph) {
    // Draw nodes
    for (let node of graph.nodes) {
        const x = node.x * cellSize + cellSize / 2;
        const y = node.y * cellSize + cellSize / 2;

        // Draw a circle representing the node
        fill(255, 255, 255, 255);
        noStroke();
        circle(x, y, cellSize / 4);

        // Draw node coordinates
        fill(255, 255, 255, 255);

        textAlign(CENTER, CENTER);
        text(`(${node.x},${node.y})`, x, y);
    }

    // Draw edges
    for (let node of graph.nodes) {
        for (let neighbor of node.adjacent) {
            const x1 = node.x * cellSize + cellSize / 2;
            const y1 = node.y * cellSize + cellSize / 2;
            const x2 = neighbor.x * cellSize + cellSize / 2;
            const y2 = neighbor.y * cellSize + cellSize / 2;

            // Draw a line between connected nodes
            stroke(255, 255, 255, 80);

            strokeWeight(1);
            line(x1, y1, x2, y2);
        }
    }
}

function draw() {
    // Set the background color of the canvas
    background(0);
    strokeWeight(0.5);

    if (isGameOver) {
        // Show game over screen or restart the game
        fill(255);
        textSize(32);
        textAlign(CENTER, CENTER);
        text('Game Over', width / 2, height / 2);
        noLoop(); // Stop the draw loop
        setTimeout(restartGame, 3000); // Restart the game after 3 seconds
        return; // Exit the function to avoid drawing anything else
    }

    // Draw the grid
    drawGrid();

    player.move();
    player.show();

    drawGraph(mapGraph);

    // Update and display each family member
    for (let member of familyMembers) {
        member.update(mapGraph);
        member.show();
        // drawPath(member.currentPath);

        // // Check for collision with the player
        // if (member.checkCollision(player)) {
        //     player.lives -= 1; // Subtract a life from the player
        //     if (player.lives <= 0) {
        //         isGameOver = true;
        //     }
        // }
    }

    // Determine the direction for shooting based on arrow key states
    let direction = "";
    if (keyIsDown(87) || keyIsDown(119)) { // 'W' or 'w'
        direction += 'w';
    }
    if (keyIsDown(65) || keyIsDown(97)) { // 'A' or 'a'
        direction += 'a';
    }
    if (keyIsDown(83) || keyIsDown(115)) { // 'S' or 's'
        direction += 's';
    }
    if (keyIsDown(68) || keyIsDown(100)) { // 'D' or 'd'
        direction += 'd';
    }

    // Shoot bullets on key press
    if (!canShoot && direction) {
        player.shoot(direction);
        canShoot = true;
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        let bulletSpeedPerFrame = bullet.speed * (deltaTime / 1000); // Decouple from frame rate

        // Calculate the new position of the bullet
        let newX = bullet.x + bullet.dx * bulletSpeedPerFrame;
        let newY = bullet.y + bullet.dy * bulletSpeedPerFrame;

        // Convert pixel coordinates back to grid index
        let gridX = Math.floor(newX / cellSize);
        let gridY = Math.floor(newY / cellSize);

        // Check if the bullet is about to hit a wall
        if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize || grid[gridX][gridY] === 0) {
            // Remove the bullet if it's out of bounds or hits a wall
            bullets.splice(i, 1);
        } else {
            // If no collision, update the bullet's position
            bullet.x = newX;
            bullet.y = newY;

            // Draw the bullet
            push();
            fill(255, 0, 0); // Bullet color
            noStroke();
            circle(bullet.x, bullet.y, cellSize / 4); // Draw the bullet
            pop();
        }
    }

    for (let obstacle of obstacles) {
        if (obstacle.isActive && player.checkCollision(obstacle)) {
            player.lives -= 1;
            obstacle.isActive = false;

            if (player.lives <= 0) {
                isGameOver = true;
            }
        }

        // Check for bullet collision with active obstacles
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (obstacle.isActive && obstacle.checkCollision(bullet)) {
                bullets.splice(j, 1); // Remove the bullet
                obstacle.isActive = false; // Deactivate the obstacle
            }
        }

        obstacle.show();
    }
}

function restartGame() {
    // Reset necessary variables and setup the game again
    isGameOver = false;
    player.lives = 5; // Reset player lives
    obstacles = []; // Clear obstacles
    bullets = []; // Clear bullets
    familyMembers = [];

    setup(); // Re-setup the game
    loop(); // Restart the draw loop
}

function keyReleased() {
    // Reset the shoot flag when any of the shooting keys is released
    if (
        keyCode === 87 || keyCode === 119 || // 'W' or 'w'
        keyCode === 65 || keyCode === 97 || // 'A' or 'a'
        keyCode === 83 || keyCode === 115 || // 'S' or 's'
        keyCode === 68 || keyCode === 100    // 'D' or 'd'
    ) {
        canShoot = false;
    }
}


