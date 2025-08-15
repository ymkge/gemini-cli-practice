class NumberGuessGame {
    constructor(min, max) {
        this.min = min;
        this.max = max;

        this.guessInput = document.getElementById('guess-input');
        this.guessButton = document.getElementById('guess-button');
        this.resetButton = document.getElementById('reset-button');
        this.messageEl = document.getElementById('message');
        this.attemptsEl = document.getElementById('attempts');

        this.secretNumber = 0;
        this.attempts = 0;

        this.addEventListeners();
        this.init();
    }

    init() {
        this.secretNumber = Math.floor(Math.random() * (this.max - this.min + 1)) + this.min;
        this.attempts = 0;
        this.updateMessage('', '');
        this.updateAttempts('');
        this.guessInput.value = '';
        this.guessInput.disabled = false;
        this.guessButton.disabled = false;
        this.resetButton.classList.add('hidden');
        this.guessInput.focus();
    }

    addEventListeners() {
        this.guessButton.addEventListener('click', () => this.checkGuess());
        this.resetButton.addEventListener('click', () => this.init());
        this.guessInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.checkGuess();
            }
        });
    }

    checkGuess() {
        const userGuess = parseInt(this.guessInput.value, 10);

        if (isNaN(userGuess) || userGuess < this.min || userGuess > this.max) {
            this.updateMessage(`1から100までの数字を入力してね`, 'error');
            return;
        }

        this.attempts++;
        this.updateAttempts(`試行回数: ${this.attempts}`);

        if (userGuess === this.secretNumber) {
            this.updateMessage('🎉 正解！ 🎉', 'success');
            this.endGame();
        } else if (userGuess < this.secretNumber) {
            this.updateMessage('もっと大きいよ！', 'low');
        } else {
            this.updateMessage('もっと小さいよ！', 'high');
        }
        this.guessInput.value = '';
        this.guessInput.focus();
    }

    updateMessage(msg, type) {
        this.messageEl.textContent = msg;
        this.messageEl.className = type;
    }

    updateAttempts(text) {
        this.attemptsEl.textContent = text;
    }

    endGame() {
        this.guessInput.disabled = true;
        this.guessButton.disabled = true;
        this.resetButton.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NumberGuessGame(1, 100);
});