// enemy.js
import { ctx } from './config.js';
import { enemyImages } from './loader.js';

export const enemyTypes = [
    { id: 1, src: 'images/enemy1.png', score: 10, speed: 2.5 },
    { id: 2, src: 'images/enemy2.png', score: 20, speed: 3 },
    { id: 3, src: 'images/enemy3.png', score: 30, speed: 2 },
    { id: 4, src: 'images/enemy4.png', score: 15, speed: 3.5 },
    { id: 5, src: 'images/enemy5.png', score: 25, speed: 2.8 },
];

export class Enemy {
    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw() {
        const image = enemyImages[this.type.id];
        if (image && image.complete && image.naturalHeight !== 0) {
            ctx.drawImage(image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.x -= this.type.speed;
    }
}
