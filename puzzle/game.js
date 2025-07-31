const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startOverlay = document.getElementById('start-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseButton');

const bgm = document.getElementById('bgm');
const popSound = document.getElementById('pop-sound');

// ゲーム設定
const GRID_SIZE = 7;
const CELL_SIZE = 60;
canvas.width = GRID_SIZE * CELL_SIZE;
canvas.height = GRID_SIZE * CELL_SIZE;

const CHARACTERS = [
    { name: '黒猫', img: 'images/black-cat.jpg' },
    { name: 'いぬ', img: 'images/dog.jpg' },
    { name: 'カエル', img: 'images/frog.jpg' },
    { name: 'ライオン', img: 'images/lion.jpg' },
    { name: 'うさぎ', img: 'images/rabbit.jpg' },
    { name: 'チーター', img: 'images/ti-ta-.jpg' },
    { name: 'ロボ', img: 'images/robo.jpg' },
    { name: '白猫', img: 'images/white-cat.jpg' }
];

let grid = [];
let score = 0;
let timeLeft = 60;
let gameOver = true;
let paused = false;
let timerId = null;
let isDragging = false;
let currentChain = [];
let characterImages = {};

// --- 初期化処理 ---
async function init() {
    await loadImages();
    resetGame();
    startOverlay.style.display = 'none';
    gameLoop();
}

function resetGame() {
    score = 0;
    timeLeft = 60;
    gameOver = false;
    paused = false;
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    gameOverOverlay.style.display = 'none';
    createGrid();
    startTimer();
    if(bgm.paused) bgm.play();
}

// --- 画像読み込み ---
function loadImages() {
    let loadedCount = 0;
    return new Promise((resolve) => {
        CHARACTERS.forEach(char => {
            const img = new Image();
            img.src = char.img;
            img.onload = () => {
                characterImages[char.name] = img;
                loadedCount++;
                if (loadedCount === CHARACTERS.length) resolve();
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${char.img}`);
                loadedCount++;
                if (loadedCount === CHARACTERS.length) resolve();
            }
        });
    });
}

// --- グリッド操作 ---
function createGrid() {
    for (let y = 0; y < GRID_SIZE; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            grid[y][x] = getRandomCharacter();
        }
    }
}

function getRandomCharacter() {
    return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

function refillGrid() {
    for (let x = 0; x < GRID_SIZE; x++) {
        let emptyCells = 0;
        for (let y = GRID_SIZE - 1; y >= 0; y--) {
            if (grid[y][x] === null) {
                emptyCells++;
            } else if (emptyCells > 0) {
                grid[y + emptyCells][x] = grid[y][x];
                grid[y][x] = null;
            }
        }
        for (let y = 0; y < emptyCells; y++) {
            grid[y][x] = getRandomCharacter();
        }
    }
}

// --- 描画処理 ---
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const character = grid[y][x];
            if (character) {
                drawTsum(x, y, character);
            }
        }
    }
}

function drawTsum(x, y, character) {
    const img = characterImages[character.name];
    const size = CELL_SIZE * 0.9; // 少し小さくして隙間を作る
    const posX = x * CELL_SIZE + (CELL_SIZE - size) / 2;
    const posY = y * CELL_SIZE + (CELL_SIZE - size) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(posX + size / 2, posY + size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    if (img) {
        ctx.clip();
        ctx.drawImage(img, posX, posY, size, size);
    } 
    ctx.restore();
}

function drawChainLine() {
    if (currentChain.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 105, 180, 0.7)';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const firstTsum = currentChain[0];
    ctx.moveTo(firstTsum.x * CELL_SIZE + CELL_SIZE / 2, firstTsum.y * CELL_SIZE + CELL_SIZE / 2);
    for (let i = 1; i < currentChain.length; i++) {
        const tsum = currentChain[i];
        ctx.lineTo(tsum.x * CELL_SIZE + CELL_SIZE / 2, tsum.y * CELL_SIZE + CELL_SIZE / 2);
    }
    ctx.stroke();
}

// --- ゲームロジック ---
function gameLoop() {
    if (gameOver) return;
    if (!paused) {
        drawGrid();
        drawChainLine();
    }
    requestAnimationFrame(gameLoop);
}

function startTimer() {
    clearInterval(timerId);
    timerId = setInterval(() => {
        if (paused || gameOver) return;
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timerId);
    gameOver = true;
    bgm.pause();
    gameOverOverlay.style.display = 'flex';
}

function togglePause() {
    paused = !paused;
    if (paused) {
        bgm.pause();
        pauseOverlay.style.display = 'flex';
    } else {
        bgm.play();
        pauseOverlay.style.display = 'none';
    }
}

// --- チェーン処理 ---
function addTsumToChain(x, y) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    const character = grid[y][x];
    if (!character) return;

    if (currentChain.length === 0) {
        currentChain.push({ x, y, character });
    } else {
        const lastTsum = currentChain[currentChain.length - 1];
        const isSameCharacter = character.name === lastTsum.character.name;
        const isAdjacent = Math.abs(x - lastTsum.x) <= 1 && Math.abs(y - lastTsum.y) <= 1;
        const isNotInChain = !currentChain.some(tsum => tsum.x === x && tsum.y === y);

        if (isSameCharacter && isAdjacent && isNotInChain) {
            currentChain.push({ x, y, character });
        }
    }
}

function processChain() {
    if (currentChain.length < 3) return;
    
    const chainLength = currentChain.length;
    score += chainLength * 10 + (chainLength - 3) * 5; // 長いほどボーナス
    scoreElement.textContent = score;
    
    popSound.currentTime = 0;
    popSound.play();

    currentChain.forEach(tsum => {
        grid[tsum.y][tsum.x] = null;
    });

    refillGrid();
}

// --- イベントリスナー ---
startButton.addEventListener('click', init);
restartButton.addEventListener('click', resetGame);
pauseButton.addEventListener('click', togglePause);
window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') togglePause();
});

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = Math.floor((clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((clientY - rect.top) / CELL_SIZE);
    return { x, y };
}

function onDragStart(e) {
    if (gameOver || paused) return;
    isDragging = true;
    currentChain = [];
    const pos = getMousePos(e);
    addTsumToChain(pos.x, pos.y);
}

function onDragMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const pos = getMousePos(e);
    addTsumToChain(pos.x, pos.y);
}

function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    processChain();
    currentChain = [];
}

canvas.addEventListener('mousedown', onDragStart);
canvas.addEventListener('mousemove', onDragMove);
canvas.addEventListener('mouseup', onDragEnd);
canvas.addEventListener('mouseleave', onDragEnd);

canvas.addEventListener('touchstart', onDragStart);
canvas.addEventListener('touchmove', onDragMove);
canvas.addEventListener('touchend', onDragEnd);
