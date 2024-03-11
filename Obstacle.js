class Obstacle {
    constructor() {
        this.posX;
        this.posY;
        this.size = cellSize;
        this.isActive = true;
        this.gridPosition;
    }

    show() {
        if (this.isActive) {
            push();
            fill(255, 0, 0);
            noStroke();
            circle(this.posX, this.posY, this.size);
            pop();
        }
    }

    checkCollision(bullet) {
        let dx = this.posX - bullet.x;
        let dy = this.posY - bullet.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        // If the distance is less than half the bullet size (as it's a circle), they're colliding
        return distance < this.size / 2;
    }
}