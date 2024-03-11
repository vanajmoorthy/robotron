function generateObstacles(numberOfObstacles, graph, excludedPositions) {
    for (let i = 0; i < numberOfObstacles; i++) {
        let obstacle = new Obstacle();
        placeObject(graph, obstacle, excludedPositions, true);
        obstacles.push(obstacle);
        // Update excluded positions with the new obstacle's position
        excludedPositions.push(obstacle.gridPosition);
    }
}
