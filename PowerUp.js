class PowerUp {
    constructor(type, x, y) {
        this.type = type; // 'freeze' or 'speed'
        this.posX = x;
        this.posY = y;
        this.active = true; // PowerUp is active when spawned
        this.size = cellSize / 2;
        this.startTime = millis(); // Track when the power-up effect starts
        // Set duration based on type: 2000 ms for 'freeze', 5000 ms for 'speed'
        this.duration = this.type === 'freeze' ? 3000 : 5000;
    }

    show() {
        push();
        rectMode(CENTER);
        if (this.type === 'freeze') {
            fill(38, 89, 255); // Blue for freeze
        } else if (this.type === 'speed') {
            fill(255, 255, 0); // Yellow for speed
        }
        noStroke();
        square(this.posX, this.posY, this.size);
        pop();

        rect(windowWidth, windowHeight, 10);
    }

    checkCollision(entity) {
        // Simple collision detection
        let d = dist(this.posX, this.posY, entity.posX, entity.posY);
        return d < (this.size / 2 + entity.size / 2);
    }

    applyEffect(player, robots) {
        pickUpSound.play();
        if (this.type === 'freeze') {
            // Freeze robots
            robots.forEach(robot => robot.isFrozen = true);
            setTimeout(() => {
                robots.forEach(robot => robot.isFrozen = false);
            }, this.duration);  // Unfreeze after 2 seconds
        } else if (this.type === 'speed') {
            // Increase player speed
            let originalSpeed = player.speed;
            player.speed *= 1.7; // Increase speed by 50%
            setTimeout(() => {
                player.speed = originalSpeed; // Revert to original speed after 5 seconds
            }, this.duration);
        }
    }
}
