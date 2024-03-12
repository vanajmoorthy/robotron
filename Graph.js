class Graph {
    constructor() {
        this.nodes = [];
        this.nodeMap = {}; // A map for quick node reference
    }

    // Method to get the walkable neighbors of a node
    getNeighbors(x, y) {
        const id = `${x}-${y}`;
        const node = this.nodeMap[id];
        return node ? node.adjacent : [];
    }

    addNode(x, y) {
        const id = `${x}-${y}`;
        if (!this.nodeMap[id]) {
            const node = new GraphNode(x, y);
            this.nodes.push(node);
            this.nodeMap[id] = node;
        }
        return this.nodeMap[id];
    }

    addEdge(node1, node2) {
        node1.addAdjacent(node2);
        node2.addAdjacent(node1);
    }

    getNode(x, y) {
        return this.nodeMap[`${x}-${y}`];
    }

    // Method to remove a node
    removeNode(x, y) {
        const id = `${x}-${y}`;
        const nodeToRemove = this.nodeMap[id];
        if (nodeToRemove) {
            // Remove this node from the adjacent lists of all its connected nodes
            nodeToRemove.adjacent.forEach(adjNode => {
                adjNode.removeAdjacent(nodeToRemove);
            });
            // Remove the node from the graph
            this.nodes = this.nodes.filter(node => node !== nodeToRemove);
            delete this.nodeMap[id];
        }
    }
}
