document.addEventListener('DOMContentLoaded', () => {
    const guessInput = document.getElementById('guess-input');
    const guessButton = document.getElementById('guess-button');
    const resetButton = document.getElementById('reset-button');
    const messageEl = document.getElementById('message');
    const attemptsEl = document.getElementById('attempts');

    let secretNumber;
    let attempts;

    function init() {
        secretNumber = Math.floor(Math.random() * 100) + 1;
        attempts = 0;
        messageEl.textContent = '';
        attemptsEl.textContent = '';
        guessInput.value = '';
        guessInput.disabled = false;
        guessButton.disabled = false;
        resetButton.classList.add('hidden');
        guessInput.focus();
    }

    function checkGuess() {
        const userGuess = parseInt(guessInput.value);

        if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
            displayMessage('1から100までの数字を入力してね', 'error');
            return;
        }

        attempts++;
        attemptsEl.textContent = `試行回数: ${attempts}`;

        if (userGuess === secretNumber) {
            displayMessage('🎉 正解！ 🎉', 'success');
            endGame();
        } else if (userGuess < secretNumber) {
            displayMessage('もっと大きいよ！', 'low');
        } else {
            displayMessage('もっと小さいよ！', 'high');
        }
        guessInput.value = '';
        guessInput.focus();
    }

    function displayMessage(msg, type) {
        messageEl.textContent = msg;
        messageEl.className = type; // for potential styling based on message type
    }

    function endGame() {
        guessInput.disabled = true;
        guessButton.disabled = true;
        resetButton.classList.remove('hidden');
    }

    guessButton.addEventListener('click', checkGuess);
    resetButton.addEventListener('click', init);

    guessInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkGuess();
        }
    });

    // Initialize the game
    init();
});
