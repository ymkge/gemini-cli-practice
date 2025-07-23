// player.js
import { ctx } from './config.js';

export class Player {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(dy) {
        this.y += dy;
        if (this.y < 0) this.y = 0;
        if (this.y + this.height > ctx.canvas.height) {
            this.y = ctx.canvas.height - this.height;
        }
    }
}
