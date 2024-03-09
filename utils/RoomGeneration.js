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
        let x = floor(random(0, gridSize - roomSize));
        let y = floor(random(0, gridSize - roomSize));

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



function connectPoints(pointA, pointB) {
    let corridor = []; // Array to hold the corridor path
    let x = pointA.x, y = pointA.y;
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
        x = constrain(x, 0, gridSize - 1);
        y = constrain(y, 0, gridSize - 1);
    }

    return corridor; // Return the array of corridor cells
}



// Function to draw the grid on the canvas
function drawGrid() {
    let cellSize = windowSize / gridSize; // Calculate the size of each grid cell

    // Iterate over each cell in the grid
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            // Fill the cell color based on its type (room or corridor)
            if (grid[x][y] == 1) {
                push();
                noStroke();
                fill(180, 180, 180);
                rect(x * cellSize, y * cellSize, cellSize, cellSize);

                pop();
            } else {
                noFill(); // No fill for empty cells
                stroke(255);
                rect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}