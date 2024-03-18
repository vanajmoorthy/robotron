// Global variables
let windowSize;            // To store the size of the window for the canvas
let grid;                  // The grid that will represent our dungeon map
let gridSize = 22;       // The size of the grid (25x25 in this case)
const roomCount = 5;       // The number of rooms to generate
const maxRoomSize = 15;    // The maximum size of a room
const rooms = [];          // An array to store the room objects
let customDeltaTime;

let cellSize; // Calculate the size of each grid cell
let bullets = [];

let player;
let mapGraph;

let canShoot = false;

let numberOfObstacles = gridSize / 4;

let obstacles = [];

let isGameOver = false;

let excludedPositions = [];
let fathers = [];
let mothers = [];
let siblings = [];
let obstacleRemovedFlag = false;

let totalScore = 0;
let lives = 3;
let robots = [];
let robotSpeed = 30;
let familySpeed = 30;
let playerSpeed = 40;

let maxNumberOfRobots = gridSize / 2;

let maxNumberOfFamilyMembers = gridSize / 3;

let resetButton;

// Probability of a family member appearing in each cell (e.g., 5%)
const familyMemberProbability = 0.075;
let robotGenerationProbability = 0.02;

let gameStartDelay = 3; // Delay in seconds before the game starts
let countdown = gameStartDelay;
let wave = 0;
let robotSpeedIncrement = 5;
let familySpeedIncrement = 5;
let playerSpeedIncrement = 4;

let gridSizeIncrement = 3; // How many waves before increasing grid size
let gameStarted = false; // This declares and initializes gameStarted globally

let lastPlayerGridPosition; // Initialize with the player's starting grid position
let isPaused = false;

let lastUpdateTime = 0; // Track the last update time for custom deltaTime calculation

let powerUps = [];
let powerUpSpawnInterval = 10000; // Example: spawn a power-up every 10 seconds
let lastPowerUpSpawnTime = 0;

let robotKillSound;
let pickUpSound;
let obstacleExplodeSound;

const familyMemberType = Object.freeze({
    MOTHER: 'mother',
    FATHER: 'father',
    SIBLING: 'sibling'
});


const robotType = Object.freeze({
    PLAYER: 'player',
    FAMILY: 'family',
    CONVERTOR: 'convertor',
    BOMBER: 'bomber'
});

function preload() {
    robotKillSound = loadSound("./assets/robot-kill.mp3");
    pickUpSound = loadSound("./assets/pick.mp3");
    obstacleExplodeSound = loadSound("./assets/obstacle-explode.mp3");
}

function setup() {
    do {
        mapGraph = new Graph();
        grid = makeGrid(gridSize);

        // Initialize the player 

        // Generate rooms and place them on the grid
        generateRooms(roomCount);

        // Connect the rooms with corridors
        connectRooms();
        refillAdjacentDiagonals(grid);

        buildGraph();
    } while (!isConnected(mapGraph));


    // Calculate the window size, leaving some margin
    windowSize = min(windowHeight, windowWidth) - 90;
    cellSize = (windowSize / gridSize);

    // Set up the canvas with the computed window size
    canvas = createCanvas(windowSize, windowSize);

    resetButton = createButton('Restart');
    let canvasPosition = canvas.position(); // Get the current position of the canvas
    resetButton.position(canvasPosition.x + windowSize - resetButton.width - 10, canvasPosition.y + 20); // Position button relative to the canvas
    resetButton.mousePressed(restartGame); // Attach the event listener to reset the game when clicked

    pauseButton = createButton('Pause');
    pauseButton.position(resetButton.x - pauseButton.width - 20, canvasPosition.y + 20);
    pauseButton.mousePressed(togglePause);

    player = new Player(lives, playerSpeed);

    placeObject(mapGraph, player, [], false, 0);
    lastPlayerGridPosition = player.gridPosition.slice();


    excludedPositions = [player.gridPosition];

    // Call this function after pruning


    generateObstacles(numberOfObstacles, mapGraph, excludedPositions);

    pruneGraph(mapGraph, obstacles);
    updateGridWithObstacles(obstacles);
    // generateRobots(numberOfRobots, mapGraph, robotSpeed);
    populateMapWithRobots(mapGraph, robotSpeed, maxNumberOfRobots);

    populateMapWithFamilyMembers(mapGraph);


}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseButton.html('Resume');
        noLoop(); // Stops the draw loop
    } else {
        pauseButton.html('Pause');
        lastUpdateTime = millis();

        loop(); // Starts the draw loop
    }

    console.log(customDeltaTime);
}



function draw() {

    if (isPaused) {
        drawPauseMenu();
        return;
    }

    const currentTime = millis();
    customDeltaTime = currentTime - lastUpdateTime;
    lastUpdateTime = currentTime;

    background(0);
    strokeWeight(0.5);
    handleCountdown();

    renderGameEntities(); // Always render all entities
    // Display lives, score, etc.
    displayGameInfo();
    if (!gameStarted || isGameOver) {
        if (isGameOver) {
            displayGameOver();
        }
        return; // Freeze updates if game hasn't started or is over
    }

    updateGameEntities();
    handlePowerUps();

}


function renderGameEntities() {
    drawGrid();
    player.show();
    [...fathers, ...mothers, ...siblings].forEach(member => member.show());
    robots.forEach(robot => robot.show(player));
    obstacles.forEach(obstacle => obstacle.show());
    bullets.forEach(bullet => {
        push();
        fill(255, 0, 0);
        noStroke();
        circle(bullet.x, bullet.y, cellSize / 4);
        pop();
    });
}

function updateGameEntities() {
    if (!gameStarted || isPaused) return; // Do not update if the game hasn't started

    // Player movement and actions
    player.move();
    player.update();

    // Shooting logic
    handleShooting();

    if (Math.floor(totalScore / 500) > Math.floor(player.lastScoreGain / 500)) {
        player.lives += 1;
        player.lastScoreGain += 500; // Increment lastScoreGain to the next threshold
        console.log('New life added! Lives:', player.lives);
    }


    // Update each family member's logic and check for collision with the player
    [...fathers, ...mothers, ...siblings].forEach(member => {
        member.update(mapGraph, robots);
        if (member.checkCollision(player)) {
            totalScore += member.points;
            member.isActive = false; // Deactivate the family member
            pickUpSound.play();
        }
    });

    // Update robots' logic
    robots.forEach(robot => {
        robot.update(player, mothers, fathers, siblings);
    });

    // Bullets logic
    updateBullets();

    for (let obstacle of obstacles) {
        if (obstacle.isActive && player.checkCollision(obstacle)) {
            player.lives -= 1;
            obstacle.isActive = false;
            player.collide();
            obstacleRemovedFlag = true;
            obstacleExplodeSound.play();
            if (player.lives <= 0) {
                isGameOver = true;
            }
        }

    }

    if (robots.length === 0) {
        wave++;
        startNewWave();
    }
}

function startNewWave() {
    gameStarted = false; // Temporarily stop the game loop while setting up the new wave

    // Increase speeds
    robotSpeed += robotSpeedIncrement;
    familySpeed += familySpeedIncrement;
    playerSpeed += playerSpeedIncrement;

    robotGenerationProbability += 0.01;

    // Check if the grid size should be increased
    if (wave % gridSizeIncrement === 0) {
        gridSize++;
        cellSize = (windowSize / gridSize);
        onGridSizeChanged();
    }

    // Reinitialize the game environment for the new wave
    // setup(); 
    reInitialiseMapAndGameState();
    countdown = gameStartDelay;
}


function onGridSizeChanged() {
    cellSize = windowSize / gridSize; // Recalculate the cell size

    obstacles.forEach(obstacle => {
        // Recalculate the position of each obstacle
        obstacle.posX = obstacle.gridPosition[0] * cellSize + cellSize / 2;
        obstacle.posY = obstacle.gridPosition[1] * cellSize + cellSize / 2;
    });

    // Also ensure player and other entities are updated here

    // Redraw the game state to apply these changes
    // redrawGameState();
}

function redrawGameState() {
    // Redraw the grid
    drawGrid();

    // Redraw all entities: player, obstacles, family members, etc.
    renderGameEntities();
}

function handleShooting() {
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
}

// Modify keyReleased to reset canShoot flag
function keyReleased() {
    if ([87, 119, 65, 97, 83, 115, 68, 100].includes(keyCode)) {
        canShoot = false;
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        // Calculate the bullet's new position based on its velocity and the elapsed time
        let newX = bullet.x + bullet.dx * (bullet.speed * (customDeltaTime / 1000));
        let newY = bullet.y + bullet.dy * (bullet.speed * (customDeltaTime / 1000));

        // Check for wall collisions
        let gridX = Math.floor(newX / cellSize);
        let gridY = Math.floor(newY / cellSize);
        if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize || grid[gridX][gridY] === 0) {
            bullets.splice(i, 1); // Remove the bullet if it hits a wall
            continue;
        }

        // Update the bullet's position
        bullet.x = newX;
        bullet.y = newY;

        // Check for collisions with obstacles and remove the bullet and obstacle if there's a hit
        for (let j = obstacles.length - 1; j >= 0; j--) {
            if (obstacles[j].isActive && obstacles[j].checkCollision(bullet)) {
                bullets.splice(i, 1); // Remove the bullet
                grid[obstacles[j].gridPosition[0]][obstacles[j].gridPosition[1]] = 1; // Make the cell walkable
                obstacles[j].isActive = false; // Deactivate the obstacle
                obstacleRemovedFlag = true;
                obstacleExplodeSound.play();

                break; // Exit the loop since the bullet has been removed
            }
        }

        // Check for collisions with robots
        for (let k = robots.length - 1; k >= 0; k--) {
            if (robots[k].isActive && robots[k].checkCollision(bullet)) {
                bullets.splice(i, 1); // Remove the bullet
                robots[k].isActive = false; // Deactivate the robot
                robots.splice(k, 1);
                obstacleExplodeSound.play();

                break; // Exit the loop since the bullet has been removed
            }
        }
    }
}



function handleCountdown() {
    if (countdown > 0) {
        if (frameCount % 60 == 0) { // Decrease countdown every second
            countdown -= 1;
        }
    } else {
        gameStarted = true;
    }
}

function restartGame() {
    // Reset necessary variables to their initial states
    isGameOver = false;
    gameStarted = false; // Ensure game is set as not started
    countdown = gameStartDelay; // Reset countdown to initial delay
    player.lives = lives;
    totalScore = 0;

    wave = 0;
    robotSpeed = 30; // Reset to initial values
    familySpeed = 30;
    gridSize = 22; // Reset grid size if you changed it

    player.lastScoreGain = 0;

    // Clear arrays holding game objects
    obstacles = [];
    bullets = [];
    fathers = [];
    mothers = [];
    siblings = [];
    robots = []; // Make sure to clear the robots array as well


    if (isPaused) {
        isPaused = false;
        pauseButton.html('Pause');
    }

    // Reinitialize the grid and mapGraph
    onGridSizeChanged();
    reInitialiseMapAndGameState();
    // Restart the draw loop
    loop();
}

function reInitialiseMapAndGameState() {
    grid = makeGrid(gridSize);
    mapGraph = new Graph();

    // Generate the game map and rebuild mapGraph
    generateRooms(roomCount);
    connectRooms();
    refillAdjacentDiagonals(grid);
    buildGraph();

    // Place player and other objects on the map
    placeObject(mapGraph, player, [], false, 0);
    lastPlayerGridPosition = player.gridPosition.slice();
    excludedPositions = [player.gridPosition]; // Update excluded positions with the new player position

    // After rebuilding the map and graph
    if (!isConnected(mapGraph)) {
        console.log("The graph is not fully connected after pruning.");
        // Optionally handle this case, e.g., by trying to reconnect the graph or regenerate the map
    } else {
        console.log("Fully connected after restart.");
    }

    // Repopulate the map with obstacles, robots, and family members
    generateObstacles(numberOfObstacles, mapGraph, excludedPositions);
    pruneGraph(mapGraph, obstacles);
    updateGridWithObstacles(obstacles);
    populateMapWithRobots(mapGraph, robotSpeed, maxNumberOfRobots);
    resetFamilyMembers();
}

function resetFamilyMembers() {
    // Clear existing family members
    fathers = [];
    mothers = [];
    siblings = [];

    // Populate the map with new family members based on the new map
    populateMapWithFamilyMembers(mapGraph);
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


