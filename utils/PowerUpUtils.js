function handlePowerUps() {
    const currentTime = millis();
    if (currentTime - lastPowerUpSpawnTime > powerUpSpawnInterval) {
        spawnPowerUp();
        lastPowerUpSpawnTime = currentTime;
    }

    // Iterate through all power-ups to show them and check for collisions
    powerUps.forEach((powerUp, index) => {
        if (powerUp.active) {
            powerUp.show();
            if (powerUp.checkCollision(player)) {
                powerUp.applyEffect(player, robots);

                powerUp.active = false; // Deactivate the power-up
            } else {
                robots.forEach(robot => {
                    if (powerUp.checkCollision(robot)) {
                        robotKillSound.play();
                        powerUp.active = false; // Power-up disappears if a robot goes over it
                    }
                });
            }
        } else {
            // Remove inactive power-ups
            powerUps.splice(index, 1);
        }
    });
}

function spawnPowerUp() {
    let existingTypes = powerUps.filter(pu => pu.active).map(pu => pu.type);
    let availableTypes = ['freeze', 'speed'].filter(t => !existingTypes.includes(t));

    // If there are no available types to spawn, exit the function
    if (availableTypes.length === 0) {
        return;
    }

    let validSpawnFound = false;
    let x, y;

    while (!validSpawnFound) {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);

        // Check if the chosen grid cell is walkable (assuming 1 represents walkable area)
        if (grid[x][y] === 1) {
            validSpawnFound = true;
        }
    }

    // Randomly choose a type from available types
    let typeIndex = Math.floor(Math.random() * availableTypes.length);
    let type = availableTypes[typeIndex];

    powerUps.push(new PowerUp(type, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2));
}



