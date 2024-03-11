function generateObstacles(numberOfObstacles, graph, playerPositionToExclude) {
    for (let i = 0; i < numberOfObstacles; i++) {
        let obstacle = new Obstacle();
        obstacles.push(obstacle);
        placeObject(graph, obstacle, playerPositionToExclude);
    }
}