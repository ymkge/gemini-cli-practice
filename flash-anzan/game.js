class FlashAnzanGame {
    constructor() {
        this.dom = {
            levelSelect: document.getElementById('level'),
            startBtn: document.getElementById('start-btn'),
            numberDisplay: document.getElementById('number-display'),
            gameArea: document.getElementById('game-area'),
            inputArea: document.getElementById('input-area'),
            answerInput: document.getElementById('answer-input'),
            submitBtn: document.getElementById('submit-btn'),
            resultArea: document.getElementById('result-area'),
            scoreSpan: document.getElementById('score'),
            setupDiv: document.getElementById('setup'),
        };

        this.state = {
            currentSum: 0,
            score: 0,
            gameInProgress: false,
            numbers: [],
            level: 1,
        };

        this.levelSettings = {
            1: { count: 2, speed: 1000 },
            2: { count: 3, speed: 900 },
            3: { count: 4, speed: 800 },
            4: { count: 5, speed: 700 },
            5: { count: 6, speed: 600 },
            6: { count: 7, speed: 500 },
            7: { count: 8, speed: 450 },
            8: { count: 9, speed: 400 },
            9: { count: 10, speed: 350 },
            10: { count: 12, speed: 300 },
        };

        this.init();
    }

    init() {
        this.dom.startBtn.addEventListener('click', () => this.startGame());
        this.dom.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.dom.answerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
    }

    startGame() {
        if (this.state.gameInProgress) return;
        this.state.gameInProgress = true;
        this.state.level = this.dom.levelSelect.value;

        this.prepareUIForGame();
        this.generateNumbers();
        this.startNumberFlash();
    }

    prepareUIForGame() {
        this.dom.setupDiv.classList.add('hidden');
        this.dom.resultArea.textContent = '';
        this.dom.answerInput.value = '';
        this.dom.gameArea.classList.remove('hidden');
        this.dom.inputArea.classList.add('hidden');
    }

    generateNumbers() {
        const { count } = this.levelSettings[this.state.level];
        this.state.numbers = [];
        this.state.currentSum = 0;
        for (let i = 0; i < count; i++) {
            const num = Math.floor(Math.random() * 900) + 100; // 3-digit numbers
            this.state.numbers.push(num);
            this.state.currentSum += num;
        }
    }

    startNumberFlash() {
        const { speed } = this.levelSettings[this.state.level];
        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex < this.state.numbers.length) {
                this.dom.numberDisplay.textContent = this.state.numbers[currentIndex];
                currentIndex++;
            } else {
                clearInterval(interval);
                this.promptForAnswer();
            }
        }, speed);
    }

    promptForAnswer() {
        this.dom.numberDisplay.textContent = '';
        this.dom.gameArea.classList.add('hidden');
        this.dom.inputArea.classList.remove('hidden');
        this.dom.answerInput.focus();
    }

    checkAnswer() {
        const userAnswer = parseInt(this.dom.answerInput.value, 10);

        if (isNaN(userAnswer)) {
            this.displayResult('数字を入力してください。', 'orange');
            return;
        }

        if (userAnswer === this.state.currentSum) {
            this.state.score += parseInt(this.state.level, 10);
            this.displayResult('正解！', 'green');
        } else {
            this.displayResult(`不正解... 正しい答えは ${this.state.currentSum} でした。`, 'red');
        }

        this.dom.scoreSpan.textContent = this.state.score;
        this.resetForNewGame();
    }

    displayResult(message, color) {
        this.dom.resultArea.textContent = message;
        this.dom.resultArea.style.color = color;
    }

    resetForNewGame() {
        this.state.gameInProgress = false;
        this.dom.setupDiv.classList.remove('hidden');
        this.dom.inputArea.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FlashAnzanGame();
});