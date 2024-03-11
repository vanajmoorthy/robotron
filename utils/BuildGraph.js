
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