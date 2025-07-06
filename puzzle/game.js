const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');

// ゲームの設定
const GRID_SIZE = 7;
const CELL_SIZE = 60;
canvas.width = GRID_SIZE * CELL_SIZE;
canvas.height = GRID_SIZE * CELL_SIZE;

const CHARACTERS = [
    { name: 'トロ', img: 'images/toro.jpg' },
    { name: 'クロ', img: 'images/kuro.jpg' },
    { name: 'ピエール', img: 'images/pierre.jpg' },
    { name: 'リッキー', img: 'images/ricky.jpg' },
    { name: 'ジュン', img: 'images/jun.jpg' },
    { name: 'スズキ', img: 'images/suzuki.jpg' }
];

let grid = [];
let score = 0;
let timeLeft = 60;
let gameOver = false;
let timerId = null;
let isDragging = false;
let currentChain = [];
let characterImages = {};

// 画像の読み込み
function loadImages() {
    let loadedCount = 0;
    const totalImages = CHARACTERS.length;

    return new Promise((resolve) => {
        CHARACTERS.forEach(char => {
            const img = new Image();
            img.src = char.img;
            img.onload = () => {
                characterImages[char.name] = img;
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            };
            img.onerror = () => {
                console.error(`画像の読み込みに失敗しました: ${char.img}`);
                // エラー時もカウントを進めて、ゲームが止まらないようにする
                loadedCount++;
                if (loadedCount === totalImages) {
                    resolve();
                }
            }
        });
    });
}

// ゲームの初期化
async function init() {
    await loadImages();
    createGrid();
    startTimer();
    gameLoop();
}

// グリッドの作成
function createGrid() {
    for (let y = 0; y < GRID_SIZE; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            grid[y][x] = getRandomCharacter();
        }
    }
}

// ランダムなキャラクターを取得
function getRandomCharacter() {
    const index = Math.floor(Math.random() * CHARACTERS.length);
    return CHARACTERS[index];
}

// グリッドの描画
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const character = grid[y][x];
            if (character) {
                const img = characterImages[character.name];
                if (img) {
                     // 円形にクリッピング
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2, true);
                    ctx.clip();
                    // 画像を描画
                    ctx.drawImage(img, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                    ctx.restore();
                } else {
                    // 画像がない場合のフォールバック（円を描画）
                    ctx.beginPath();
                    ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 5, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ccc'; // グレー
                    ctx.fill();
                }
            }
        }
    }
}

// ゲームループ
function gameLoop() {
    if (gameOver) return;

    drawGrid();
    drawChainLine();

    requestAnimationFrame(gameLoop);
}

// タイマーを開始
function startTimer() {
    timerId = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerId);
            gameOver = true;
            showGameOver();
        }
    }, 1000);
}

// ゲームオーバー表示
function showGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2);
}

// イベントリスナー
canvas.addEventListener('mousedown', (e) => {
    if (gameOver) return;
    isDragging = true;
    currentChain = [];
    const pos = getMousePos(e);
    addTsumToChain(pos.x, pos.y);
});

canvas.addEventListener('mousemove', (e) => {
    if (gameOver || !isDragging) return;
    const pos = getMousePos(e);
    addTsumToChain(pos.x, pos.y);
});

canvas.addEventListener('mouseup', () => {
    if (gameOver) return;
    isDragging = false;
    if (currentChain.length >= 3) {
        removeChain();
        refillGrid();
    }
    currentChain = [];
});

// マウス位置をグリッド座標に変換
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    return { x, y };
}

// ツムをチェーンに追加
function addTsumToChain(x, y) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

    const character = grid[y][x];
    if (!character) return;

    // チェーンが空か、同じキャラクターで、隣接している場合
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

// チェーンの削除とスコア加算
function removeChain() {
    score += currentChain.length * 10; // スコア計算
    scoreElement.textContent = score;

    currentChain.forEach(tsum => {
        grid[tsum.y][tsum.x] = null;
    });
}

// グリッドの補充
function refillGrid() {
    // 列ごとに処理
    for (let x = 0; x < GRID_SIZE; x++) {
        let emptyCells = 0;
        // 下から上に見て、nullのセルを数える
        for (let y = GRID_SIZE - 1; y >= 0; y--) {
            if (grid[y][x] === null) {
                emptyCells++;
            } else if (emptyCells > 0) {
                // 上にあるツムを下に落とす
                grid[y + emptyCells][x] = grid[y][x];
                grid[y][x] = null;
            }
        }
        // 新しいツムを補充
        for (let y = 0; y < emptyCells; y++) {
            grid[y][x] = getRandomCharacter();
        }
    }
}

// チェーンの線を描画
function drawChainLine() {
    if (currentChain.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 10;

    const firstTsum = currentChain[0];
    ctx.moveTo(firstTsum.x * CELL_SIZE + CELL_SIZE / 2, firstTsum.y * CELL_SIZE + CELL_SIZE / 2);

    for (let i = 1; i < currentChain.length; i++) {
        const tsum = currentChain[i];
        ctx.lineTo(tsum.x * CELL_SIZE + CELL_SIZE / 2, tsum.y * CELL_SIZE + CELL_SIZE / 2);
    }
    ctx.stroke();
}

init();
