// main.js
import {
    config
} from './config.js';
import { Player } from './player.js';
import { Bullet } from './bullet.js';
import { Enemy, enemyTypes } from './enemy.js';
import { drawEndScreen, setupClearParticles } from './ui.js';
import { loadImages, loadedImages } from './loader.js';

export let gameState = {};
let animationFrameId;

// Audio elements
let bgm;
let shootSfx;
let explosionSfx;
let gameOverSfx;
let gameClearSfx;

const keyState = {};
window.addEventListener('keydown', (e) => {
    keyState[e.code] = true;
    if (!gameState.gameRunning && !gameState.isGameFinished && !gameState.isPaused) {
        startGame(); // Start game on first keydown if not already running
    }
    if (e.code === 'Space' && !gameState.isPaused && !gameState.isGameFinished && gameState.player) {
        gameState.bullets.push(new Bullet(
            gameState.player.x + config.PLAYER_WIDTH,
            gameState.player.y + config.PLAYER_HEIGHT / 2 - 2.5,
            15, 5, '#00ffff', config.BULLET_SPEED
        ));
        if (shootSfx) {
            shootSfx.currentTime = 0; // Reset sound for quick successive shots
            shootSfx.play().catch(error => console.error("Shoot SFX playback prevented:", error));
        }
    }
});
window.addEventListener('keyup', (e) => { keyState[e.code] = false; });

pauseBtn.addEventListener('click', () => {
    if (gameState.isGameFinished) return;
    gameState.isPaused = !gameState.isPaused;
    config.pauseBtn.textContent = gameState.isPaused ? '再開' : '一時停止';
    if (gameState.isPaused) {
        bgm.pause();
    } else {
        bgm.play();
    }
});

config.restartBtn.addEventListener('click', init);
config.startButton.addEventListener('click', startGame); // Add event listener for start button

function init() {
    gameState = {
        player: new Player(50, config.ctx.canvas.height / 2 - config.PLAYER_HEIGHT / 2, config.PLAYER_WIDTH, config.PLAYER_HEIGHT, loadedImages.player),
        bullets: [],
        enemies: [],
        particles: [],
        stars: [],
        score: 0,
        lastEnemySpawnTime: 0,
        isPaused: false,
        isGameFinished: false,
        isGameClear: false,
        gameRunning: false, // Game is not running initially
    };
    config.scoreValue.textContent = gameState.score;
    config.pauseBtn.textContent = '一時停止';

    // Get audio elements
    bgm = document.getElementById('bgm');
    shootSfx = document.getElementById('shootSfx');
    explosionSfx = document.getElementById('explosionSfx');
    gameOverSfx = document.getElementById('gameOverSfx');
    gameClearSfx = document.getElementById('gameClearSfx');

    createStars();

    // gameLoop() is now called by startGame() only.
}

function startGame() {
    if (!gameState.gameRunning && !gameState.isGameFinished) {
        gameState.gameRunning = true;
        bgm.play().catch(error => console.error("BGM auto-play prevented:", error));
        if (!animationFrameId) {
            gameLoop();
        }
    }
}

function createStars() {
    for (let i = 0; i < 100; i++) {
        gameState.stars.push({
            x: Math.random() * config.ctx.canvas.width,
            y: Math.random() * config.ctx.canvas.height,
            radius: Math.random() * 1.5,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        gameState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 3 + 1,
            color: `rgba(255, ${Math.random() * 200 + 55}, 0, ${Math.random()})`,
            life: 30
        });
    }
    if (explosionSfx) {
        explosionSfx.currentTime = 0;
        explosionSfx.play().catch(error => console.error("Explosion SFX playback prevented:", error));
    }
}

function update(timestamp) {
    if (gameState.isPaused || gameState.isGameFinished) return;

    if (keyState['ArrowUp']) gameState.player.move(-config.PLAYER_SPEED);
    if (keyState['ArrowDown']) gameState.player.move(config.PLAYER_SPEED);

    gameState.bullets.forEach((bullet, i) => {
        bullet.update();
        if (bullet.x - bullet.width > config.ctx.canvas.width) gameState.bullets.splice(i, 1);
    });

    if (timestamp - gameState.lastEnemySpawnTime > config.ENEMY_SPAWN_INTERVAL) {
        gameState.lastEnemySpawnTime = timestamp;
        const y = Math.random() * (config.ctx.canvas.height - config.ENEMY_HEIGHT);
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        gameState.enemies.push(new Enemy(config.ctx.canvas.width, y, config.ENEMY_WIDTH, config.ENEMY_HEIGHT, randomType));
    }
    gameState.enemies.forEach((enemy, i) => {
        enemy.update();
        if (enemy.x + config.ENEMY_WIDTH < 0) gameState.enemies.splice(i, 1);
    });

    // Update stars
    gameState.stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = config.ctx.canvas.width;
            star.y = Math.random() * config.ctx.canvas.height;
        }
    });

    // Update particles
    gameState.particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
            gameState.particles.splice(index, 1);
        }
    });

    checkCollisions();
}

function checkCollisions() {
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            const bullet = gameState.bullets[i];
            const enemy = gameState.enemies[j];
            // Collision detection for rectangular bullets
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                gameState.bullets.splice(i, 1);
                gameState.enemies.splice(j, 1);
                gameState.score += enemy.type.score;
                config.scoreValue.textContent = gameState.score;
                if (gameState.score >= config.GOAL_SCORE) {
                    gameState.isGameFinished = true;
                    gameState.isGameClear = true;
                    setupClearParticles();
                    bgm.pause();
                    if (gameClearSfx) {
                        gameClearSfx.play().catch(error => console.error("Game Clear SFX playback prevented:", error));
                    }
                }
                break;
            }
        }
    }

    for (const enemy of gameState.enemies) {
        if (gameState.player.x < enemy.x + enemy.width && gameState.player.x + gameState.player.width > enemy.x &&
            gameState.player.y < enemy.y + enemy.height && gameState.player.y + gameState.player.height > enemy.y) {
            gameState.isGameFinished = true;
            gameState.isGameClear = false;
            if (bgm) bgm.pause();
            if (gameOverSfx) {
                gameOverSfx.play().catch(error => console.error("Game Over SFX playback prevented:", error));
            }
            return;
        }
    }
}

function draw() {
    config.ctx.clearRect(0, 0, config.ctx.canvas.width, config.ctx.canvas.height);

    // Draw stars
    config.ctx.fillStyle = '#fff';
    gameState.stars.forEach(star => {
        config.ctx.beginPath();
        config.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        config.ctx.fill();
    });

    if (!gameState.isGameFinished) {
        gameState.player.draw();
        gameState.bullets.forEach(b => b.draw());
        gameState.enemies.forEach(e => e.draw(loadedImages));
    } else {
        drawEndScreen();
    }

    // Draw particles
    gameState.particles.forEach(p => {
        config.ctx.fillStyle = p.color;
        config.ctx.beginPath();
        config.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        config.ctx.fill();
    });
}

function gameLoop(timestamp) {
    update(timestamp);
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}

loadImages(() => {
    console.log("すべての画像が処理されました。ゲームを初期化します。");
    init();
});

// Initial BGM play on first user interaction (e.g., keydown for movement)
// This listener is now also responsible for starting the game if not already running.
window.addEventListener('keydown', (e) => {
    if (!gameState.gameRunning && !gameState.isGameFinished && !gameState.isPaused) {
        startGame(); // Start game on first keydown if not already running
    }
    if (e.code === 'Space' && !gameState.isPaused && !gameState.isGameFinished && gameState.player) {
        gameState.bullets.push(new Bullet(
            gameState.player.x + config.PLAYER_WIDTH,
            gameState.player.y + config.PLAYER_HEIGHT / 2 - 2.5,
            15, 5, '#00ffff', config.BULLET_SPEED
        ));
        if (shootSfx) {
            shootSfx.currentTime = 0; // Reset sound for quick successive shots
            shootSfx.play().catch(error => console.error("Shoot SFX playback prevented:", error));
        }
    }
}, { once: true }); // Play BGM only once on first keydown
