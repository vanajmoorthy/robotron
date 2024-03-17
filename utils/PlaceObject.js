function placeObject(graph, object, excludedPositions = [], avoidAdjacent = true, type) {
    if (!graph || !graph.nodes) {
        console.error("Graph or nodes are undefined.");
        return;
    }

    // Convert graph nodes to array
    let nodes = Object.values(graph.nodes);

    // Filter nodes to exclude any specified positions
    let possibleStartNodes = nodes.filter(node =>
        !excludedPositions.some(excludedPos =>
            node.x === excludedPos[0] && node.y === excludedPos[1]
        )
    );

    if (avoidAdjacent) {
        // Further filter to exclude nodes adjacent to existing objects
        possibleStartNodes = possibleStartNodes.filter(node =>
            !possibleStartNodes.some(adjacentNode =>
                excludedPositions.some(excludedPos =>
                    Math.abs(adjacentNode.x - node.x) <= 1 &&
                    Math.abs(adjacentNode.y - node.y) <= 1 &&
                    adjacentNode.x === excludedPos[0] && adjacentNode.y === excludedPos[1]
                )
            )
        );
    }

    let startNode;
    let tries = 0;
    do {
        if (possibleStartNodes.length === 0) {
            console.error("No valid positions available for placing the object.");
            return; // Exit the function if no valid positions are left
        }
        // Choose a random node from the filtered nodes
        startNode = possibleStartNodes[Math.floor(Math.random() * possibleStartNodes.length)];
        tries++;
    } while ((avoidAdjacent && anyAdjacentNodeIsExcluded(startNode, excludedPositions)) && tries < 100);

    if (!startNode) {
        console.error("Failed to find a valid position for the object.");
        return;
    }



    object.gridPosition = [startNode.x, startNode.y];
    // Derive posX and posY from gridPosition
    object.posX = object.gridPosition[0] * cellSize + cellSize / 2;
    object.posY = object.gridPosition[1] * cellSize + cellSize / 2;
}

function anyAdjacentNodeIsExcluded(node, excludedPositions) {
    const directions = [
        [0, -1], // Up
        [1, 0],  // Right
        [0, 1],  // Down
        [-1, 0], // Left
    ];
    return directions.some(([dx, dy]) =>
        excludedPositions.some(([ex, ey]) =>
            node.x + dx === ex && node.y + dy === ey
        )
    );
}
