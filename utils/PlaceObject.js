function placeObject(graph, object, excludedPositions = []) {
    // Convert graph nodes to array
    const nodes = Object.values(graph.nodes);

    // Filter nodes to only include those with adjacent nodes (i.e., not isolated)
    let possibleStartNodes = nodes.filter(node => node.adjacent.length > 0);

    // Further filter out any nodes that are in the excludedPositions array
    possibleStartNodes = possibleStartNodes.filter(node =>
        !excludedPositions.some(excludedPos =>
            node.x === excludedPos.x && node.y === excludedPos.y
        )
    );
    let startNode;
    let tries = 0; // to prevent an infinite loop
    do {
        // Choose a random node from the filtered nodes
        startNode = possibleStartNodes[Math.floor(Math.random() * possibleStartNodes.length)];
        tries++;
    } while ((startNode.x === 0 || startNode.x === gridSize - 1 || startNode.y === 0 || startNode.y === gridSize - 1) && tries < 100);
    // This loop avoids the edges and also ensures we do not loop forever

    // Now you have a random valid starting node for the player
    object.posX = startNode.x * cellSize + cellSize / 2; // Center the object in the cell
    object.posY = startNode.y * cellSize + cellSize / 2; // Center the player in the cell
    object.gridPosition = [startNode.x, startNode.y];
}
