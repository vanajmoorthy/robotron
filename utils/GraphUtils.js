
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

function pruneGraph(graph, obstacles) {
    obstacles.forEach(obstacle => {
        const [obstacleX, obstacleY] = obstacle.gridPosition;
        // Remove the obstacle node from the graph
        graph.removeNode(obstacleX, obstacleY);
    });

    // Iterate through all remaining nodes to remove connections to the removed nodes
    graph.nodes.forEach(node => {
        // Filter out connections to removed nodes
        node.adjacent = node.adjacent.filter(neighbor => {
            return !obstacles.some(obstacle => obstacle[0] === neighbor.x && obstacle[1] === neighbor.y);
        });
    });
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