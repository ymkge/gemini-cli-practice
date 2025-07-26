document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const turnElement = document.getElementById('turn');
    const blackCapturesElement = document.getElementById('black-captures');
    const whiteCapturesElement = document.getElementById('white-captures');
    const messageBox = document.getElementById('message-box');
    const scoreModal = document.getElementById('score-modal');
    const scoreDetailsElement = document.getElementById('score-details');

    let currentBoardState = [];
    let boardSize = 19;

    const getStarPoints = (size) => {
        if (size === 9) return [[2, 2], [2, 6], [6, 2], [6, 6], [4, 4]];
        if (size === 13) return [[3, 3], [3, 9], [9, 3], [9, 9], [6, 6]];
        if (size === 19) return [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]];
        return [];
    };

    const drawBoard = (size) => {
        boardSize = size;
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        boardElement.style.width = `${size * 40}px`;
        boardElement.style.height = `${size * 40}px`;

        const starPoints = getStarPoints(size);

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.y = r;
                cell.dataset.x = c;

                const hLine = document.createElement('div');
                hLine.classList.add('grid-line-h');
                const vLine = document.createElement('div');
                vLine.classList.add('grid-line-v');

                // --- Start of Fix ---
                // Horizontal line logic
                if (c === 0) { // Left edge
                    hLine.style.width = '50%';
                    hLine.style.left = '50%';
                } else if (c === size - 1) { // Right edge
                    hLine.style.width = '50%';
                } // Middle cells have full width by default

                // Vertical line logic
                if (r === 0) { // Top edge
                    vLine.style.height = '50%';
                    vLine.style.top = '50%';
                } else if (r === size - 1) { // Bottom edge
                    vLine.style.height = '50%';
                } // Middle cells have full height by default
                // --- End of Fix ---

                cell.appendChild(hLine);
                cell.appendChild(vLine);

                if (starPoints.some(p => p[0] === r && p[1] === c)) {
                    const star = document.createElement('div');
                    star.classList.add('star-point');
                    cell.appendChild(star);
                }

                boardElement.appendChild(cell);
            }
        }
    };

    const updateUI = (gameState) => {
        const size = gameState.size;
        // Redraw board only if size changes
        if (boardSize !== size || currentBoardState.length === 0) {
            drawBoard(size);
        }
        currentBoardState = gameState.board;

        // Clear existing stones
        document.querySelectorAll('.stone').forEach(s => s.remove());

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (gameState.board[r][c] !== 0) {
                    const stone = document.createElement('div');
                    stone.classList.add('stone');
                    stone.classList.add(gameState.board[r][c] === 1 ? 'black' : 'white');
                    const cell = boardElement.querySelector(`[data-y='${r}'][data-x='${c}']`);
                    cell.appendChild(stone);
                }
            }
        }

        turnElement.textContent = gameState.turn === 1 ? '黒' : '白';
        turnElement.style.color = gameState.turn === 1 ? 'black' : '#555';
        blackCapturesElement.textContent = gameState.captures['1'] || 0;
        whiteCapturesElement.textContent = gameState.captures['2'] || 0;
        messageBox.textContent = '';

        if (gameState.game_over) {
            if (gameState.resigned_player) {
                const winner = gameState.resigned_player === 1 ? '白' : '黒';
                messageBox.textContent = `${winner}の勝ちです（投了）`;
            } else {
                fetchScore();
            }
        }
    };

    const handleApiCall = async (url, options) => {
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) {
                messageBox.textContent = data.error || '不明なエラーが発生しました。';
                if (data.state) updateUI(data.state);
            } else {
                updateUI(data);
            }
        } catch (error) {
            console.error('API Error:', error);
            messageBox.textContent = 'サーバーとの通信に失敗しました。';
        }
    };

    const fetchScore = async () => {
        try {
            const response = await fetch('/api/score');
            const data = await response.json();
            if (response.ok) {
                displayScore(data);
            } else {
                messageBox.textContent = data.error || 'スコアの計算に失敗しました。';
            }
        } catch (error) {
            console.error('Score fetch error:', error);
        }
    };

    const displayScore = (data) => {
        const { state, score_info } = data;
        const { territory, scores } = score_info;
        const black_score = scores['1'];
        const white_score = scores['2'];

        let resultText = '';
        if (black_score > white_score) {
            resultText = `黒の${(black_score - white_score).toFixed(1)}目勝ちです。`;
        } else if (white_score > black_score) {
            resultText = `白の${(white_score - black_score).toFixed(1)}目勝ちです。`;
        } else {
            resultText = '引き分けです。';
        }

        scoreDetailsElement.innerHTML = `
            <p>黒の地: ${territory['1']}目</p>
            <p>白の地: ${territory['2']}目</p>
            <p>黒のアゲハマ: ${state.captures['1']}個</p>
            <p>白のアゲハマ: ${state.captures['2']}個</p>
            <p>コミ: ${state.komi}目</p>
            <hr>
            <p><b>黒の最終得点:</b> ${black_score.toFixed(1)}目</p>
            <p><b>白の最終得点:</b> ${white_score.toFixed(1)}目</p>
            <h3>${resultText}</h3>
        `;
        scoreModal.style.display = 'flex';
    };

    document.getElementById('new-game-btn').addEventListener('click', () => startNewGame(9));
    document.getElementById('new-game-13-btn').addEventListener('click', () => startNewGame(13));
    document.getElementById('new-game-19-btn').addEventListener('click', () => startNewGame(19));

    const startNewGame = (size) => {
        handleApiCall('/api/new_game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ size: size, handicap: 0 })
        });
        scoreModal.style.display = 'none';
    };

    document.getElementById('pass-btn').addEventListener('click', () => {
        handleApiCall('/api/pass', { method: 'POST' });
    });

    document.getElementById('undo-btn').addEventListener('click', () => {
        handleApiCall('/api/undo', { method: 'POST' });
    });

    document.getElementById('resign-btn').addEventListener('click', () => {
        if (confirm('本当に投了しますか？')) {
            handleApiCall('/api/resign', { method: 'POST' });
        }
    });

    boardElement.addEventListener('click', (e) => {
        const cell = e.target.closest('.grid-cell');
        if (cell && !cell.querySelector('.stone')) {
            const y = parseInt(cell.dataset.y, 10);
            const x = parseInt(cell.dataset.x, 10);
            handleApiCall('/api/play', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ y, x })
            });
        }
    });

    document.getElementById('close-score-modal').addEventListener('click', () => {
        scoreModal.style.display = 'none';
        startNewGame(boardSize); // Or go to a neutral state
    });

    // Initial game start
    startNewGame(19);
});