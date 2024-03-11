function placeObject(graph, object, excludedPositions = [], avoidAdjacent = true) {
    if (!graph || !graph.nodes) {
        console.error("Graph or nodes are undefined.");
        return;
    }
    // Convert graph nodes to array
    const nodes = Object.values(graph.nodes);
    console.log(excludedPositions);

    // Filter nodes to exclude any specified positions
    let possibleStartNodes = nodes.filter(node =>
        !excludedPositions.some(excludedPos =>
            node.x === excludedPos.x && node.y === excludedPos.y
        )
    );

    if (avoidAdjacent) {
        // Further filter to exclude nodes adjacent to existing objects
        possibleStartNodes = possibleStartNodes.filter(node =>
            !nodes.some(adjacentNode =>
                Math.abs(adjacentNode.x - node.x) <= 1 &&
                Math.abs(adjacentNode.y - node.y) <= 1 &&
                excludedPositions.some(excludedPos =>
                    adjacentNode.x === excludedPos.x && adjacentNode.y === excludedPos.y
                )
            )
        );
    }

    let startNode;
    let tries = 0; // to prevent an infinite loop
    do {
        // Choose a random node from the filtered nodes
        if (possibleStartNodes.length === 0) {
            console.error("No valid positions available for placing the object.");
            return; // Exit the function if no valid positions are left
        }
        startNode = possibleStartNodes[Math.floor(Math.random() * possibleStartNodes.length)];
        tries++;
    } while (tries < 100);

    // Now you have a random valid starting node for the object
    object.posX = startNode.x * cellSize + cellSize / 2; // Center the object in the cell
    object.posY = startNode.y * cellSize + cellSize / 2; // Center the object in the cell
    object.gridPosition = [startNode.x, startNode.y];
}
