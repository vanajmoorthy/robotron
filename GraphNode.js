class GraphNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.adjacent = []; // List of adjacent nodes
    }

    addAdjacent(node) {
        this.adjacent.push(node);
    }

    // Method to remove an adjacent node
    removeAdjacent(nodeToRemove) {
        this.adjacent = this.adjacent.filter(node => node !== nodeToRemove);
    }
}