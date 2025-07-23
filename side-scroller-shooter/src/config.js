// config.js
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

export const pauseBtn = document.getElementById('pauseBtn');
export const restartBtn = document.getElementById('restartBtn');
export const scoreValue = document.getElementById('scoreValue');

export const GOAL_SCORE = 500;
export const PLAYER_WIDTH = 50;
export const PLAYER_HEIGHT = 30;
export const PLAYER_SPEED = 8;
export const BULLET_SPEED = 7;
export const BULLET_RADIUS = 5;
export const ENEMY_WIDTH = 40;
export const ENEMY_HEIGHT = 40;
export const ENEMY_SPAWN_INTERVAL = 1000;
