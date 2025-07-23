// ui.js
import { ctx } from './config.js';
import { gameState } from './main.js';

function drawGameClearScreen() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    gameState.particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y > ctx.canvas.height) {
            p.y = -p.radius;
            p.x = Math.random() * ctx.canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = p.color;
        ctx.fill();
    });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 70px "Impact", sans-serif';
    ctx.fillStyle = 'gold';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText('GAME CLEAR!', ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);
    ctx.fillText('GAME CLEAR!', ctx.canvas.width / 2, ctx.canvas.height / 2 - 50);
    ctx.font = '30px "Arial", sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(`Final Score: ${gameState.score}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
    ctx.font = '20px "Arial", sans-serif';
    ctx.fillText('"リスタート" ボタンで再挑戦！', ctx.canvas.width / 2, ctx.canvas.height / 2 + 70);
}

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ゲームオーバー', ctx.canvas.width / 2, ctx.canvas.height / 2);
}

export function drawEndScreen() {
    if (gameState.isGameClear) {
        drawGameClearScreen();
    } else {
        drawGameOverScreen();
    }
}

export function setupClearParticles() {
    gameState.particles = [];
    const PARTICLE_COUNT = 150;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        gameState.particles.push({
            x: Math.random() * ctx.canvas.width,
            y: Math.random() * ctx.canvas.height,
            radius: Math.random() * 4 + 2,
            color: `hsl(${Math.random() * 360}, 90%, 60%)`,
            speedY: Math.random() * 2 + 1,
            speedX: Math.random() * 2 - 1
        });
    }
}
