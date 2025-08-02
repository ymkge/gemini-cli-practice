class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 50;
        this.height = 50;
        this.speed = 5;
        this.x = this.canvas.width / 2 - this.width / 2;
        this.y = this.canvas.height - 60;
        this.dx = 0;
        this.image = new Image();
        this.image.src = 'images/player.png';
    }

    draw(ctx) {
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#0f0';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    move() {
        this.x += this.dx;
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.x + this.width > this.canvas.width) {
            this.x = this.canvas.width - this.width;
        }
    }

    shoot() {
        return new Bullet(this.x + this.width / 2 - 2.5, this.y);
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 20;
        this.speed = 10;
    }

    draw(ctx) {
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0; // Reset shadow for other elements
    }

    move() {
        this.y -= this.speed;
    }
}

class Invader {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.status = 1; // 1: alive, 0: destroyed
        this.image = new Image();
        const enemyImageIndex = Math.floor(Math.random() * 5) + 1;
        this.image.src = `images/enemy${enemyImageIndex}.png`;
    }

    draw(ctx) {
        if (this.status === 1) {
            if (this.image.complete) {
                ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            } else {
                ctx.fillStyle = '#0f0';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        }
    }
}

class Game {
    constructor(canvas, scoreElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = scoreElement;
        this.bgm = document.getElementById('bgm');
        this.shootSfx = document.getElementById('shootSfx');
        this.explosionSfx = document.getElementById('explosionSfx');
        this.gameOverSfx = document.getElementById('gameOverSfx');
        this.stars = [];
        this.createStars();
        this.particles = [];
        this.init();
    }

    init() {
        this.score = 0;
        this.gameRunning = false;
        this.animationId = null;
        this.invadersDirection = 1;
        this.invadersSpeed = 0.8;
        this.frameCount = 0;

        this.player = new Player(this.canvas);
        this.bullets = [];
        this.invaders = [];
        this.createInvaders();
        this.updateScore();
    }

    createStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.5,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }

    drawStars() {
        this.ctx.fillStyle = '#fff';
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    createExplosion(x, y) {
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: Math.random() * 3 + 1,
                color: `rgba(255, ${Math.random() * 255}, 0, ${Math.random()})`,
                life: 30
            });
        }
    }

    drawParticles() {
        this.particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(index, 1);
            } else {
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    createInvaders() {
        const rows = 5;
        const cols = 10;
        const invaderWidth = 40;
        const invaderHeight = 30;
        const padding = 10;
        const offsetTop = 30;
        const offsetLeft = 30;

        this.invaders = [];
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const x = (c * (invaderWidth + padding)) + offsetLeft;
                const y = (r * (invaderHeight + padding)) + offsetTop;
                this.invaders.push(new Invader(x, y));
            }
        }
    }

    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.bgm.play().catch(e => console.error("BGM playback failed:", e));
            this.loop();
        }
    }

    stop() {
        this.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    reset() {
        this.stop();
        this.bgm.pause();
        this.bgm.currentTime = 0;
        this.init();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();
    }

    loop() {
        this.update();

        if (this.gameRunning) {
            this.draw();
            this.animationId = requestAnimationFrame(() => this.loop());
        }
    }

    update() {
        this.player.move();
        this.bullets.forEach((bullet, index) => {
            bullet.move();
            if (bullet.y < 0) {
                this.bullets.splice(index, 1);
            }
        });
        this.moveInvaders();
        this.handleCollisions();
        this.checkGameState();

        this.frameCount++;
        if (this.frameCount % 180 === 0) { // 約3秒ごと (60fpsの場合)
            if (this.invadersSpeed < 4.0) { // 速度の上限
                this.invadersSpeed *= 1.1;
            }
        }
    }

    moveInvaders() {
        let changeDirection = false;
        this.invaders.forEach(invader => {
            if (invader.status === 1) {
                invader.x += this.invadersSpeed * this.invadersDirection;
                if (invader.x + invader.width > this.canvas.width || invader.x < 0) {
                    changeDirection = true;
                }
            }
        });

        if (changeDirection) {
            this.invadersDirection *= -1;
            this.invaders.forEach(invader => {
                invader.y += invader.height;
            });
        }
    }

    handleCollisions() {
        // Bullet-Invader collision
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.invaders.length - 1; j >= 0; j--) {
                const invader = this.invaders[j];
                if (invader.status === 1 &&
                    bullet.x > invader.x &&
                    bullet.x < invader.x + invader.width &&
                    bullet.y > invader.y &&
                    bullet.y < invader.y + invader.height) {
                    this.createExplosion(invader.x + invader.width / 2, invader.y + invader.height / 2);
                    invader.status = 0;
                    this.bullets.splice(i, 1);
                    this.score += 10;
                    this.updateScore();
                    this.explosionSfx.currentTime = 0;
                    this.explosionSfx.play();
                    break; // Exit inner loop once bullet hits an invader
                }
            }
        }

        // Player-Invader collision
        this.invaders.forEach(invader => {
            if (invader.status === 1 &&
                this.player.x < invader.x + invader.width &&
                this.player.x + this.player.width > invader.x &&
                this.player.y < invader.y + invader.height &&
                this.player.y + this.player.height > invader.y) {
                this.gameOver();
            }
        });
    }

    checkGameState() {
        const allInvadersDestroyed = this.invaders.every(invader => invader.status === 0);
        if (allInvadersDestroyed) {
            this.gameClear();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawStars();
        this.player.draw(this.ctx);
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.invaders.forEach(invader => invader.draw(this.ctx));
        this.drawParticles();
    }

    updateScore() {
        this.scoreElement.innerHTML = `Score: ${this.score}`;
    }

    gameOver() {
        this.stop();
        this.bgm.pause();
        this.gameOverSfx.play();
        this.showMessage('GAME OVER', '#f00');
    }

    gameClear() {
        this.stop();
        this.showMessage('GAME CLEAR', '#0f0');
    }

    showMessage(text, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = "40px 'Press Start 2P'";
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowRight' || e.key === 'Right') {
            this.player.dx = this.player.speed;
        } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
            this.player.dx = -this.player.speed;
        } else if (e.key === ' ' || e.key === 'Spacebar') {
            if (this.gameRunning) {
                this.bullets.push(this.player.shoot());
                this.shootSfx.currentTime = 0;
                this.shootSfx.play();
            }
        }
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'ArrowLeft' || e.key === 'Left') {
            this.player.dx = 0;
        }
    }
}

// --- Main Execution ---
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const scoreElement = document.getElementById('score');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const resetButton = document.getElementById('resetButton');

    const game = new Game(canvas, scoreElement);
    game.draw(); // Initial draw

    startButton.addEventListener('click', () => game.start());
    stopButton.addEventListener('click', () => game.stop());
    resetButton.addEventListener('click', () => game.reset());

    document.addEventListener('keydown', (e) => game.handleKeyDown(e));
    document.addEventListener('keyup', (e) => game.handleKeyUp(e));
});