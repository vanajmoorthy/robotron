// Function to create a 2D grid array filled with zeros
function makeGrid(size) {
    let arr = new Array(size);
    for (let i = 0; i < size; i++) {
        arr[i] = new Array(size).fill(0); // Fill each row with zeros
    }
    return arr; // Return the 2D array
}

// Function to generate rooms
function generateRooms(count) {
    while (rooms.length < count) {
        // Randomly determine room size and position
        let roomSize = floor(random(3, maxRoomSize));
        // Ensure rooms are generated at least one cell away from the edge
        let x = floor(random(1, gridSize - roomSize - 1));
        let y = floor(random(1, gridSize - roomSize - 1));

        // Create a room object with boundaries
        let room = { x, y, width: roomSize, height: roomSize };

        // Check if the new room overlaps with existing rooms or is too close to them
        let overlap = rooms.some(r => !(r.x + r.width < room.x - 1 ||
            r.x > room.x + roomSize + 1 ||
            r.y + r.height < room.y - 1 ||
            r.y > room.y + roomSize + 1));

        // If there's no overlap, add the new room to the rooms array
        if (!overlap) {
            rooms.push(room);
            // Mark the room cells in the grid
            for (let w = 0; w < roomSize; w++) {
                for (let h = 0; h < roomSize; h++) {
                    if (random() > 0.25) {
                        grid[x + w][y + h] = 1;
                    }
                }
            }
        }
    }
}


// Function to connect rooms with corridors
function connectRooms() {
    // Connect every room to every other room
    for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
            // Select two rooms to connect
            let roomA = rooms[i];
            let roomB = rooms[j];

            // Choose random points within the two rooms
            let pointA = {
                x: roomA.x + floor(random(roomA.width)),
                y: roomA.y + floor(random(roomA.height))
            };
            let pointB = {
                x: roomB.x + floor(random(roomB.width)),
                y: roomB.y + floor(random(roomB.height))
            };

            // Create a corridor between those points
            let corridor = connectPoints(pointA, pointB);

            // Mark the corridor path on the grid
            corridor.forEach(point => {
                grid[point.x][point.y] = 1; // 1 denotes a movable cell space
            });
        }
    }
}

function refillAdjacentDiagonals(grid) {
    for (let i = 1; i < grid.length - 1; i++) {
        for (let j = 1; j < grid[i].length - 1; j++) {
            let topLeft = grid[i - 1][j - 1];
            let top = grid[i][j - 1];
            let topRight = grid[i + 1][j - 1];

            let left = grid[i - 1][j];
            let right = grid[i + 1][j];

            let bottomLeft = grid[i - 1][j + 1];
            let bottom = grid[i][j + 1];
            let bottomRight = grid[i + 1][j + 1];

            if (grid[i][j] == 1) {

                if (top == 0 && right == 0 && topRight == 1) {
                    // Fill right cell
                    grid[i + 1][j] = 1;
                } else if (right == 0 && bottom == 0 && bottomRight == 1) {
                    // Fill right cell
                    grid[i + 1][j] = 1;
                } else if (bottom == 0 && left == 0 && bottomLeft == 1) {
                    // Fill left cell
                    grid[i - 1][j] = 1;
                } else if (left == 0 && top == 0 && topLeft == 1) {
                    // Fill left cell
                    grid[i - 1][j] = 1;
                }

                // This section of the code is checking if there is a horizontal path through the current cell.
                // If there is a room or corridor to the left (grid[i-1][j] == 1) AND to the right (grid[i+1][j] == 1) of the current cell,
                // it will then check the diagonally adjacent cells to see if they should be converted into corridors or not.
                // This helps to avoid isolated diagonal corridors which are not reachable.
                if (grid[i - 1][j] == 1 && grid[i + 1][j] == 1) {
                    // These lines check each diagonally adjacent cell. If the cell is already part of a room or corridor (value of 1),
                    // it remains unchanged. Otherwise, it's left as an empty space (value of 0).
                    grid[i - 1][j - 1] = grid[i - 1][j - 1] == 1 ? 1 : 0;
                    grid[i + 1][j - 1] = grid[i + 1][j - 1] == 1 ? 1 : 0;
                    grid[i - 1][j + 1] = grid[i - 1][j + 1] == 1 ? 1 : 0;
                    grid[i + 1][j + 1] = grid[i + 1][j + 1] == 1 ? 1 : 0;
                }

                // This section is doing the same thing as the previous one, but for a vertical path through the current cell.
                // If there is a room or corridor above (grid[i][j-1] == 1) AND below (grid[i][j+1] == 1) the current cell,
                // it performs the same checks on the diagonally adjacent cells to ensure there's no isolated corridor created diagonally.
                if (grid[i][j - 1] == 1 && grid[i][j + 1] == 1) {
                    grid[i - 1][j - 1] = grid[i - 1][j - 1] == 1 ? 1 : 0;
                    grid[i + 1][j - 1] = grid[i + 1][j - 1] == 1 ? 1 : 0;
                    grid[i - 1][j + 1] = grid[i - 1][j + 1] == 1 ? 1 : 0;
                    grid[i + 1][j + 1] = grid[i + 1][j + 1] == 1 ? 1 : 0;
                }
            }
        }
    }
}


function connectPoints(pointA, pointB) {
    let corridor = []; // Array to hold the corridor path

    let x = pointA.x;
    let y = pointA.y;

    let lastDirection = null; // Variable to store the last movement direction

    let targetX = pointB.x;
    let targetY = pointB.y;

    // Function to determine the next move direction with more variation
    function nextMove() {
        let directions = ['horizontal', 'vertical'];
        let direction;

        // Increase the probability of changing direction
        if (lastDirection && random() < 0.7) {
            direction = lastDirection === 'horizontal' ? 'vertical' : 'horizontal';
        } else {
            direction = random(directions);
        }

        // Execute the move
        if (direction === 'horizontal' && x !== targetX) {
            x < targetX ? x++ : x--;
            lastDirection = 'horizontal';
        } else if (direction === 'vertical' && y !== targetY) {
            y < targetY ? y++ : y--;
            lastDirection = 'vertical';
        }
    }



    // While the target is not reached, keep moving
    while (x !== targetX || y !== targetY) {
        corridor.push({ x, y });

        // Introduce more frequent turns
        if (random() < 0.5) {
            nextMove();
        } else {
            // Continue moving in the same direction with a chance of a slight turn
            if (random() < 0.9) {
                nextMove();
            } else {
                // Move diagonally as a slight turn
                if (x !== targetX) x < targetX ? x++ : x--;
                if (y !== targetY) y < targetY ? y++ : y--;
                lastDirection = null; // Reset last direction after a diagonal move
            }
        }

        // Enforce grid boundaries
        x = constrain(x, 1, gridSize - 1);
        y = constrain(y, 1, gridSize - 1);
    }

    return corridor; // Return the array of corridor cells
}



// Function to draw the grid on the canvas
function drawGrid() {
    let cellSize = windowSize / gridSize; // Calculate the size of each grid cell
    textSize(cellSize / 4); // Adjust text size based on the cell size
    fill(255);
    textAlign(CENTER, CENTER);
    // Iterate over each cell in the grid
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            // Fill the cell color based on its type (room or corridor)
            if (grid[x][y] == 1) {
                push();
                stroke(255);
                strokeWeight(0.5);
                fill(180, 180, 180);
                rect(x * cellSize, y * cellSize, cellSize, cellSize);

                pop();
            } else if (grid[x][y] == 3) { // For debugging
                push();
                stroke(255);
                strokeWeight(0.5);
                fill(255, 0, 0);
                rect(x * cellSize, y * cellSize, cellSize, cellSize);

                pop();
            } else {
                noFill(); // No fill for empty cells
                stroke(255);
                rect(x * cellSize, y * cellSize, cellSize, cellSize);
            }

            fill(255); // Text color

            // For debugging
            text(`${x},${y}`, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
        }
    }
}
