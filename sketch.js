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
let mapGraph = new Graph();

let shootFlag = false;


function setup() {
    // Calculate the size of each grid cell

    // Calculate the window size, leaving some margin
    windowSize = min(windowHeight, windowWidth) - 30;
    cellSize = (windowSize / gridSize);

    // Set up the canvas with the computed window size
    createCanvas(windowSize, windowSize);

    // Initialize the grid
    grid = makeGrid(gridSize);

    // let startPosition = findStartPositionInRoomOrCorridor();
    let startPosition = createVector(0, 0);

    // Initialize the player with the start position
    player = new Player(cellSize - 5, startPosition, 5);


    // Generate rooms and place them on the grid
    generateRooms(roomCount);

    // Connect the rooms with corridors
    connectRooms();
    refillAdjacentDiagonals(grid);

    buildGraph();

    placePlayer(mapGraph);

}


function draw() {
    // Set the background color of the canvas
    background(0);
    strokeWeight(0.5);

    // Draw the grid
    drawGrid();

    player.move();
    player.show();

    // Determine the direction for shooting based on key states
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
    if (!shootFlag && direction) {
        player.shoot(direction);
        shootFlag = true;
    }

    // Update and show bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        fill(255, 0, 0); // Bullet color
        circle(bullet.x, bullet.y, cellSize / 4); // Draw the bullet
        let bulletSpeedPerFrame = bullet.speed * (deltaTime / 1000); // Decouple from frame rate
        bullet.x += bullet.dx * bulletSpeedPerFrame; // Move the bullet decoupled from frame rate
        bullet.y += bullet.dy * bulletSpeedPerFrame; // Move the bullet decoupled from frame rate

        // Remove bullets that go off-screen
        if (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
            bullets.splice(i, 1);
        }
    }


}

function placePlayer(graph) {
    // Convert graph nodes to array
    const nodes = Object.values(graph.nodes);

    // Filter nodes to only include those with adjacent nodes (i.e., not isolated)
    const possibleStartNodes = nodes.filter(node => node.adjacent.length > 0);

    let startNode;
    let tries = 0; // to prevent an infinite loop
    do {
        // Choose a random node from the filtered nodes
        startNode = possibleStartNodes[Math.floor(Math.random() * possibleStartNodes.length)];
        tries++;
    } while ((startNode.x === 0 || startNode.x === gridSize - 1 || startNode.y === 0 || startNode.y === gridSize - 1) && tries < 100);
    // This loop avoids the edges and also ensures we do not loop forever

    // Now you have a random valid starting node for the player
    player.posX = startNode.x * cellSize + cellSize / 2; // Center the player in the cell
    player.posY = startNode.y * cellSize + cellSize / 2; // Center the player in the cell
}



// Function to build the graph based on the grid
// Function to build the graph based on the grid
function buildGraph() {
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            if (grid[x][y] === 1) { // If the cell is walkable
                let node = mapGraph.addNode(x, y);

                // Check orthogonal adjacent cells (up, down, left, right)
                const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
                for (const [dx, dy] of directions) {
                    let newX = x + dx;
                    let newY = y + dy;

                    if (newX >= 0 && newY >= 0 && newX < gridSize && newY < gridSize) {
                        if (grid[newX][newY] === 1) { // If the adjacent cell is walkable
                            let adjacentNode = mapGraph.addNode(newX, newY);
                            mapGraph.addEdge(node, adjacentNode);
                        }
                    }
                }
            }
        }
    }
}

function keyReleased() {
    // Reset the shoot flag when any of the shooting keys is released
    if (
        keyCode === 87 || keyCode === 119 || // 'W' or 'w'
        keyCode === 65 || keyCode === 97 || // 'A' or 'a'
        keyCode === 83 || keyCode === 115 || // 'S' or 's'
        keyCode === 68 || keyCode === 100    // 'D' or 'd'
    ) {
        shootFlag = false;
    }
}


