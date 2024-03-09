class GraphNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.adjacent = []; // List of adjacent nodes
    }

    addAdjacent(node) {
        this.adjacent.push(node);
    }
}

class Graph {
    constructor() {
        this.nodes = [];
        this.nodeMap = {}; // A map for quick node reference
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
        node2.addAdjacent(node1); // If the graph is undirected
    }

    getNode(x, y) {
        return this.nodeMap[`${x}-${y}`];
    }
}
