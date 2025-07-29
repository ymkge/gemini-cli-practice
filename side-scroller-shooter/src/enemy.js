// enemy.js
import { config } from './config.js';

export const enemyTypes = [
    { id: 'enemy1', imagePath: 'images/enemy1.png', score: 10, speed: 2.5 },
    { id: 'enemy2', imagePath: 'images/enemy2.png', score: 20, speed: 3 },
    { id: 'enemy3', imagePath: 'images/enemy3.png', score: 30, speed: 2 },
    { id: 'enemy4', imagePath: 'images/enemy4.png', score: 15, speed: 3.5 },
    { id: 'enemy5', imagePath: 'images/enemy5.png', score: 25, speed: 2.8 },
];

export class Enemy {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw(loadedImages) {
        const image = loadedImages[this.type.id];
        if (image && image.complete && image.naturalHeight !== 0) {
            config.ctx.drawImage(image, this.x, this.y, this.width, this.height);
        } else {
            config.ctx.fillStyle = 'red';
            config.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.x -= this.type.speed;
    }
}
