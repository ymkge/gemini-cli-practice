// main.js
import {
    ctx, GOAL_SCORE, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED,
    BULLET_SPEED, BULLET_RADIUS, ENEMY_WIDTH, ENEMY_HEIGHT, ENEMY_SPAWN_INTERVAL,
    pauseBtn, restartBtn, scoreValue
} from './config.js';
import { Player } from './player.js';
import { Bullet } from './bullet.js';
import { Enemy, enemyTypes } from './enemy.js';
import { drawEndScreen, setupClearParticles } from './ui.js';
import { loadImages } from './loader.js';

export let gameState = {};
let animationFrameId;

const keyState = {};
window.addEventListener('keydown', (e) => {
    keyState[e.code] = true;
    if (e.code === 'Space' && !gameState.isPaused && !gameState.isGameFinished && gameState.player) {
        gameState.bullets.push(new Bullet(
            gameState.player.x + PLAYER_WIDTH,
            gameState.player.y + PLAYER_HEIGHT / 2,
            BULLET_RADIUS, 'green', BULLET_SPEED
        ));
    }
});
window.addEventListener('keyup', (e) => { keyState[e.code] = false; });

pauseBtn.addEventListener('click', () => {
    if (gameState.isGameFinished) return;
    gameState.isPaused = !gameState.isPaused;
    pauseBtn.textContent = gameState.isPaused ? '再開' : '一時停止';
});

restartBtn.addEventListener('click', init);

function init() {
    gameState = {
        player: new Player(50, ctx.canvas.height / 2 - PLAYER_HEIGHT / 2, PLAYER_WIDTH, PLAYER_HEIGHT, 'blue'),
        bullets: [],
        enemies: [],
        particles: [],
        score: 0,
        lastEnemySpawnTime: 0,
        isPaused: false,
        isGameFinished: false,
        isGameClear: false,
    };
    scoreValue.textContent = gameState.score;
    pauseBtn.textContent = '一時停止';

    if (!animationFrameId) {
        gameLoop();
    }
}

function update(timestamp) {
    if (gameState.isPaused || gameState.isGameFinished) return;

    if (keyState['ArrowUp']) gameState.player.move(-PLAYER_SPEED);
    if (keyState['ArrowDown']) gameState.player.move(PLAYER_SPEED);

    gameState.bullets.forEach((bullet, i) => {
        bullet.update();
        if (bullet.x - bullet.radius > ctx.canvas.width) gameState.bullets.splice(i, 1);
    });

    if (timestamp - gameState.lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
        gameState.lastEnemySpawnTime = timestamp;
        const y = Math.random() * (ctx.canvas.height - ENEMY_HEIGHT);
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        gameState.enemies.push(new Enemy(ctx.canvas.width, y, ENEMY_WIDTH, ENEMY_HEIGHT, randomType));
    }
    gameState.enemies.forEach((enemy, i) => {
        enemy.update();
        if (enemy.x + ENEMY_WIDTH < 0) gameState.enemies.splice(i, 1);
    });

    checkCollisions();
}

function checkCollisions() {
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            const bullet = gameState.bullets[i];
            const enemy = gameState.enemies[j];
            if (bullet.x + bullet.radius > enemy.x && bullet.x - bullet.radius < enemy.x + enemy.width &&
                bullet.y + bullet.radius > enemy.y && bullet.y - bullet.radius < enemy.y + enemy.height) {
                gameState.bullets.splice(i, 1);
                gameState.enemies.splice(j, 1);
                gameState.score += enemy.type.score;
                scoreValue.textContent = gameState.score;
                if (gameState.score >= GOAL_SCORE) {
                    gameState.isGameFinished = true;
                    gameState.isGameClear = true;
                    setupClearParticles();
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
            return;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!gameState.isGameFinished) {
        gameState.player.draw();
        gameState.bullets.forEach(b => b.draw());
        gameState.enemies.forEach(e => e.draw());
    } else {
        drawEndScreen();
    }
}

function gameLoop(timestamp) {
    update(timestamp);
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
}

loadImages(() => {
    console.log("すべての敵画像が処理されました。ゲームを開始します。");
    init();
});
