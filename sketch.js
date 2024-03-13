// Global variables
let windowSize;            // To store the size of the window for the canvas
let grid;                  // The grid that will represent our dungeon map
const gridSize = 22;       // The size of the grid (25x25 in this case)
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
let fathers = [];
let mothers = [];
let siblings = [];

let familySpeed = 50;

let totalScore = 0;
let lives = 3;
let numberOfRobots = 3;
let robots = [];
let robotSpeed = 70;

// Probability of a family member appearing in each cell (e.g., 5%)
const familyMemberProbability = 0.05;

const familyMemberType = Object.freeze({
    MOTHER: 'mother',
    FATHER: 'father',
    SIBLING: 'sibling'
});



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
    player = new Player(lives);

    // Generate rooms and place them on the grid
    generateRooms(roomCount);

    // Connect the rooms with corridors
    connectRooms();
    refillAdjacentDiagonals(grid);

    buildGraph();

    placeObject(mapGraph, player, [], false, 0);

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
    updateGridWithObstacles(obstacles);
    generateRobots(numberOfRobots, mapGraph, robotSpeed);
    populateMapWithFamilyMembers(mapGraph);


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
    player.update();

    // drawGraph(mapGraph);

    // Update and display each family member
    for (let member of fathers) {
        member.update(mapGraph);
        member.show();
        // drawPath(member.currentPath);

        // Check for collision with the player
        if (member.checkCollision(player)) {
            console.log(`rescue ${member.type}`);
            totalScore += member.points;
            member.isActive = false;
        }
    }

    for (let member of mothers) {
        member.update(mapGraph);
        member.show();
        // drawPath(member.currentPath);

        // Check for collision with the player
        if (member.checkCollision(player)) {
            console.log(`rescue ${member.type}`);
            totalScore += member.points;
            member.isActive = false;

        }
    }

    for (let member of siblings) {
        member.update(mapGraph);
        member.show();
        // drawPath(member.currentPath);


        // Check for collision with the player
        if (member.checkCollision(player)) {
            console.log(`rescue ${member.type}`);
            totalScore += member.points;
            member.isActive = false;

        }
    }

    for (let robot of robots) {
        robot.update(player);
        robot.show();
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
            player.collide();
            if (player.lives <= 0) {
                isGameOver = true;
            }
        }

        // Check for bullet collision with active obstacles
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];
            if (obstacle.isActive && obstacle.checkCollision(bullet)) {
                bullets.splice(j, 1); // Remove the bullet
                // Set the cell to traversable after the object is removed
                grid[obstacle.gridPosition[0]][obstacle.gridPosition[1]] = 1;
                obstacle.isActive = false; // Deactivate the obstacle
            }
        }

        obstacle.show();
    }

    push();
    fill(255); // Text color
    textSize(cellSize / 2);
    textAlign(LEFT);
    text(`Lives remaining: ${player.lives}`, cellSize / 2, cellSize / 2);
    text(`Score: ${totalScore}`, cellSize / 2, cellSize * 1.5);

    pop();
}

function restartGame() {
    // Reset necessary variables and setup the game again
    isGameOver = false;
    player.lives = lives; // Reset player lives
    obstacles = []; // Clear obstacles
    bullets = []; // Clear bullets
    fathers = [];
    mothers = [];
    siblings = [];
    totalScore = 0;

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


