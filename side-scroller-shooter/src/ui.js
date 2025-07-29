// ui.js
import { config } from './config.js';
import { gameState } from './main.js';

function drawGameClearScreen() {
    config.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'; // Light green overlay
    config.ctx.fillRect(0, 0, config.ctx.canvas.width, config.ctx.canvas.height);

    gameState.particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y > config.ctx.canvas.height) {
            p.y = -p.radius;
            p.x = Math.random() * config.ctx.canvas.width;
        }
        config.ctx.beginPath();
        config.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
        config.ctx.fillStyle = p.color;
        config.ctx.fill();
    });

    config.ctx.textAlign = 'center';
    config.ctx.textBaseline = 'middle';

    config.ctx.font = 'bold 80px "Orbitron", sans-serif';
    config.ctx.fillStyle = '#00ff00'; // Neon green
    config.ctx.shadowColor = '#00ff00';
    config.ctx.shadowBlur = 20;
    config.ctx.fillText('VICTORY!', config.ctx.canvas.width / 2, config.ctx.canvas.height / 2 - 70);
    config.ctx.shadowBlur = 0;

    config.ctx.font = 'bold 40px "Orbitron", sans-serif';
    config.ctx.fillStyle = '#00ffff'; // Cyan
    config.ctx.fillText(`SCORE: ${gameState.score}`, config.ctx.canvas.width / 2, config.ctx.canvas.height / 2 + 10);

    config.ctx.font = '25px "Orbitron", sans-serif';
    config.ctx.fillStyle = '#fff';
    config.ctx.fillText('PRESS RESTART TO PLAY AGAIN!', config.ctx.canvas.width / 2, config.ctx.canvas.height / 2 + 80);
}

function drawGameOverScreen() {
    config.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Red overlay
    config.ctx.fillRect(0, 0, config.ctx.canvas.width, config.ctx.canvas.height);

    config.ctx.textAlign = 'center';
    config.ctx.textBaseline = 'middle';

    config.ctx.font = 'bold 80px "Orbitron", sans-serif';
    config.ctx.fillStyle = '#ff0000'; // Red
    config.ctx.shadowColor = '#ff0000';
    config.ctx.shadowBlur = 20;
    config.ctx.fillText('DEFEAT', config.ctx.canvas.width / 2, config.ctx.canvas.height / 2 - 30);
    config.ctx.shadowBlur = 0;

    config.ctx.font = '25px "Orbitron", sans-serif';
    config.ctx.fillStyle = '#fff';
    config.ctx.fillText('PRESS RESTART TO TRY AGAIN!', config.ctx.canvas.width / 2, config.ctx.canvas.height / 2 + 40);
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
            x: Math.random() * config.ctx.canvas.width,
            y: Math.random() * config.ctx.canvas.height,
            radius: Math.random() * 4 + 2,
            color: `hsl(${Math.random() * 360}, 90%, 60%)`,
            speedY: Math.random() * 2 + 1,
            speedX: Math.random() * 2 - 1
        });
    }
}
