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
            if (grid[x][y] == 1 || grid[x][y] == 2) {
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
            // text(`${grid[x][y]}`, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);

        }
    }
}
