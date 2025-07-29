// config.js

const canvas = document.getElementById('gameCanvas');

export const config = {
    ctx: canvas.getContext('2d'),
    pauseBtn: document.getElementById('pauseBtn'),
    restartBtn: document.getElementById('restartBtn'),
    startButton: document.getElementById('startButton'),
    scoreValue: document.getElementById('scoreValue'),

    GOAL_SCORE: 500,
    PLAYER_WIDTH: 50,
    PLAYER_HEIGHT: 30,
    PLAYER_SPEED: 8,
    BULLET_SPEED: 7,
    BULLET_RADIUS: 5,
    ENEMY_WIDTH: 40,
    ENEMY_HEIGHT: 40,
    ENEMY_SPAWN_INTERVAL: 1000,
    playerBulletDamage: 1,
};