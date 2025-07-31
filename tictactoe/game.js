const board = document.getElementById('board');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('resetButton');
const playCountSpan = document.getElementById('playCount');
const messageOverlay = document.getElementById('messageOverlay');
const messageText = document.getElementById('messageText');
const newGameButton = document.getElementById('newGameButton');

let currentPlayer = 'X';
let boardState = Array(9).fill(null);
let gameActive = true;
let playCount = 0;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (boardState[clickedCellIndex] !== null || !gameActive) {
        return;
    }

    updateCell(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function updateCell(cell, index) {
    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
}

function changePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
}

function handleResultValidation() {
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        const a = boardState[winCondition[0]];
        const b = boardState[winCondition[1]];
        const c = boardState[winCondition[2]];

        if (a === null || b === null || c === null) {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            winningLine = winCondition;
            break;
        }
    }

    if (roundWon) {
        highlightWinningCells(winningLine);
        showMessage(`Player ${currentPlayer} has won!`);
        gameActive = false;
        updatePlayCount();
        return;
    }

    const roundDraw = !boardState.includes(null);
    if (roundDraw) {
        showMessage('Game ended in a draw!');
        gameActive = false;
        updatePlayCount();
        return;
    }

    changePlayer();
}

function showMessage(message) {
    messageText.textContent = message;
    messageOverlay.style.display = 'flex';
    statusDisplay.textContent = '';
}

function highlightWinningCells(winningLine) {
    winningLine.forEach(index => {
        document.querySelector(`.cell[data-index='${index}']`).classList.add('win');
    });
}

function updatePlayCount() {
    playCount++;
    playCountSpan.textContent = playCount;
}

function resetGame() {
    boardState = Array(9).fill(null);
    gameActive = true;
    currentPlayer = 'X';
    statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
    messageOverlay.style.display = 'none';
    
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'win');
    });
}

// Create board cells
for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('data-index', i);
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
}

resetButton.addEventListener('click', resetGame);
newGameButton.addEventListener('click', resetGame);