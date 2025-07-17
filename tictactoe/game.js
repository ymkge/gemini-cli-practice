const board = document.getElementById('board');
const resetButton = document.getElementById('resetButton');
const playCountSpan = document.getElementById('playCount');
let currentPlayer = 'X';
let boardState = Array(9).fill(null);
let gameActive = true;
let playCount = 0;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (boardState[clickedCellIndex] !== null || !gameActive) {
        return;
    }

    boardState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;

    handleResultValidation();
}

function handleResultValidation() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = boardState[winCondition[0]];
        let b = boardState[winCondition[1]];
        let c = boardState[winCondition[2]];

        if (a === null || b === null || c === null) {
            continue;
        }

        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        alert(`Player ${currentPlayer} has won!`);
        gameActive = false;
        updatePlayCount();
        return;
    }

    let roundDraw = !boardState.includes(null);
    if (roundDraw) {
        alert('Game ended in a draw!');
        gameActive = false;
        updatePlayCount();
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function updatePlayCount() {
    playCount++;
    playCountSpan.textContent = playCount;
}

function resetGame() {
    boardState = Array(9).fill(null);
    gameActive = true;
    currentPlayer = 'X';
    document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
}


for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('data-index', i);
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
}

resetButton.addEventListener('click', resetGame);
