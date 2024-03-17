function populateMapWithRobots(graph, speed, maxNumberOfRobots) {
    let nodes = Object.values(graph.nodes);
    let counter = 0;

    nodes.forEach(node => {
        // if (counter > 8 && counter < 10) {
        //     let newRobot = new Robot(mapGraph, speed);

        //     robots.push(newRobot);
        //     newRobot.gridPosition = [node.x, node.y];
        //     newRobot.posX = node.x * cellSize + cellSize / 2;
        //     newRobot.posY = node.y * cellSize + cellSize / 2;
        // };
        // counter++;

        if (Math.random() < robotGenerationProbability) {
            // Here you would decide the type randomly or by some other logic
            let newRobot = new Robot(mapGraph, speed);

            // Make sure this position is not already taken by another family member or the player
            if (!positionIsTaken([node.x, node.y]) && robots.length < maxNumberOfRobots) {
                // Place the family member in this cell
                newRobot.gridPosition = [node.x, node.y];
                newRobot.posX = node.x * cellSize + cellSize / 2;
                newRobot.posY = node.y * cellSize + cellSize / 2;
                robots.push(newRobot);
            }
        }
    });
}