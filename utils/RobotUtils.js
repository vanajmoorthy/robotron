function populateMapWithRobots(graph, speed, maxNumberOfRobots) {
    let nodes = Object.values(graph.nodes);

    let familyRobot = new Robot(mapGraph, speed, robotType.FAMILY); // Create a new robot with the random type
    let playerRobot = new Robot(mapGraph, speed, robotType.PLAYER); // Create a new robot with the random type
    let convertorRobot = new Robot(mapGraph, speed, robotType.CONVERTOR); // Create a new robot with the random type

    placeObject(mapGraph, familyRobot, [], false, 0);
    placeObject(mapGraph, playerRobot, [], false, 0);
    placeObject(mapGraph, convertorRobot, [], false, 0);

    robots.push(familyRobot);
    robots.push(playerRobot);
    robots.push(convertorRobot);


    nodes.forEach(node => {
        if (Math.random() < robotGenerationProbability) {
            const robotType = getRandomRobotType(); // Get a random robot type
            let newRobot = new Robot(mapGraph, speed, robotType); // Create a new robot with the random type

            // Make sure this position is not already taken by another entity
            if (!positionIsTaken([node.x, node.y]) && robots.length < maxNumberOfRobots) {
                newRobot.gridPosition = [node.x, node.y];
                newRobot.posX = node.x * cellSize + cellSize / 2;
                newRobot.posY = node.y * cellSize + cellSize / 2;
                robots.push(newRobot);
            }
        }
    });
}

function getRandomRobotType() {
    const types = Object.values(robotType).slice(0, -1); // Convert enum to array without last value
    const randomIndex = Math.floor(Math.random() * types.length); // Generate a random index
    return types[randomIndex]; // Return a random robot type
}

