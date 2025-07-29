// bullet.js
import { config } from './config.js';

export class Bullet {
    constructor(x, y, width, height, color, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speed = speed;
    }

    draw() {
        config.ctx.fillStyle = this.color;
        config.ctx.shadowColor = this.color;
        config.ctx.shadowBlur = 10;
        config.ctx.fillRect(this.x, this.y, this.width, this.height);
        config.ctx.shadowBlur = 0; // Reset shadow for other elements
    }

    update() {
        this.x += this.speed;
    }
}
