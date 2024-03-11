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