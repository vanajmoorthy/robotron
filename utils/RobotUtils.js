function generateRobots(numberOfRobots, mapGraph, speed) {
    for (let i = 0; i < numberOfRobots; i++) {
        let robot = new Robot(mapGraph, speed);
        // You might need a function similar to placeObject to position the robots
        placeObject(mapGraph, robot, excludedPositions, true);
        robots.push(robot);
    }
}