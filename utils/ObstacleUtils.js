function generateObstacles(numberOfObstacles, graph, excludedPositions) {
    for (let i = 0; i < numberOfObstacles; i++) {
        let obstacle = new Obstacle();
        placeObject(graph, obstacle, excludedPositions, true, 0);
        obstacles.push(obstacle);
        // Update excluded positions with the new obstacle's position
        excludedPositions.push(obstacle.gridPosition);
    }
}

function updateGridWithObstacles(obstacles) {
    // Iterate over the obstacles array
    obstacles.forEach(obstacle => {
        // Assuming obstacle.gridPosition contains the grid coordinates of the obstacle
        const [x, y] = obstacle.gridPosition;
        // Update the grid cell to 2 to indicate an obstacle
        grid[x][y] = 2;
    });
}
