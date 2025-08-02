const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const bgm = document.getElementById('bgm');
const bounceSfx = document.getElementById('bounceSfx');
const breakSfx = document.getElementById('breakSfx');
const gameOverSfx = document.getElementById('gameOverSfx');
const winSfx = document.getElementById('winSfx');

let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const ballRadius = 10;
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let score = 0;
let paused = false;
let gameOver = false;
let gameWon = false;
let particles = [];
let frameCount = 0;

const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const brickColors = [
    { color1: "#ff6b6b", color2: "#f06595" },
    { color1: "#fcc419", color2: "#ff922b" },
    { color1: "#51cf66", color2: "#94d82d" },
];

let bricks = [];
for(let c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(let r=0; r<brickRowCount; r++) {
        const color = brickColors[r % brickColors.length];
        bricks[c][r] = { x: 0, y: 0, status: 1, color1: color.color1, color2: color.color2 };
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', () => { document.location.reload() });


function playBgm() {
    bgm.play().catch(error => {
        console.log("BGM play was prevented: " + error);
    });
}

let bgmStarted = false;

function keyDownHandler(e) {
    if (!bgmStarted && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        playBgm();
        bgmStarted = true;
    }

    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function togglePause() {
    paused = !paused;
    if (!paused) {
        draw();
    }
}

function createParticles(brick) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: brick.x + brickWidth / 2,
            y: brick.y + brickHeight / 2,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            size: Math.random() * 3 + 1,
            color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${Math.random()})`,
            life: 30
        });
    }
}

function drawParticles() {
    particles.forEach((p, index) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life--;

        if (p.life <= 0) {
            particles.splice(index, 1);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.closePath();
        }
    });
}

function collisionDetection() {
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status == 1) {
                if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    createParticles(b);
                    breakSfx.play();
                    document.getElementById('score').innerHTML = "Score: " + score;
                    if(score == brickRowCount*brickColumnCount) {
                        gameWon = true;
                        winSfx.play();
                        bgm.pause();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(x, y, ballRadius / 2, x, y, ballRadius);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(1, "#ff6b6b");
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
    // Reset shadow properties
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawPaddle() {
    ctx.beginPath();
    const gradient = ctx.createLinearGradient(paddleX, canvas.height - paddleHeight, paddleX, canvas.height);
    gradient.addColorStop(0, "#ff6b6b");
    gradient.addColorStop(1, "#ff8787");
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fill();
    ctx.closePath();
    // Reset shadow properties
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawBricks() {
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status == 1) {
                let brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
                let brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                const gradient = ctx.createLinearGradient(brickX, brickY, brickX + brickWidth, brickY + brickHeight);
                gradient.addColorStop(0, bricks[c][r].color1);
                gradient.addColorStop(1, bricks[c][r].color2);
                ctx.fillStyle = gradient;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fill();
                ctx.closePath();
                // Reset shadow properties
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }
        }
    }
}

function drawGameOver() {
    ctx.font = "48px 'Arial', sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2);
}

function drawYouWin() {
    ctx.font = "48px 'Arial', sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillText("YOU WIN!", canvas.width/2, canvas.height/2);
}

function draw() {
    if (paused) {
        return;
    }

    if (gameOver) {
        drawGameOver();
        return;
    }

    if (gameWon) {
        drawYouWin();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawParticles();
    collisionDetection();

    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
        bounceSfx.play();
    }
    if(y + dy < ballRadius) {
        dy = -dy;
        bounceSfx.play();
    }
    else if(y + dy > canvas.height-ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            bounceSfx.play();
        }
        else {
            gameOver = true;
            gameOverSfx.play();
            bgm.pause();
        }
    }

    if(rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += 7;
    }
    else if(leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    x += dx;
    y += dy;

    frameCount++;
    if (frameCount % 180 === 0) { // 約3秒ごと (60fpsの場合)
        if (Math.abs(dx) < 5) { // 速度の上限
            dx *= 1.1;
            dy *= 1.1;
        }
    }

    requestAnimationFrame(draw);
}

draw();
