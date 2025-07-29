// player.js
import { config } from './config.js';
import { Bullet } from './bullet.js';

export class Player {
    constructor(x, y, width, height, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image; // Store the image object
    }

    draw() {
        if (this.image && this.image.complete && this.image.naturalHeight !== 0) {
            config.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback if image not loaded
            config.ctx.fillStyle = 'blue'; // Use a default color for fallback
            config.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    move(dy) {
        this.y += dy;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > config.ctx.canvas.height) {
            this.y = config.ctx.canvas.height - this.height;
        }
    }

    shoot() {
        return new Bullet(this.x + this.width, this.y + this.height / 2 - 2.5, 15, 5, '#00ffff', config.bulletSpeed);
    }
}
