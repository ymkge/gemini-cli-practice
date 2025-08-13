document.addEventListener('DOMContentLoaded', () => {
    const levelSelect = document.getElementById('level');
    const startBtn = document.getElementById('start-btn');
    const numberDisplay = document.getElementById('number-display');
    const gameArea = document.getElementById('game-area');
    const inputArea = document.getElementById('input-area');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const resultArea = document.getElementById('result-area');
    const scoreSpan = document.getElementById('score');
    const setupDiv = document.getElementById('setup');

    let currentSum = 0;
    let score = 0;
    let gameInProgress = false;

    const levelSettings = {
        1: { count: 3, speed: 1000 },
        2: { count: 4, speed: 900 },
        3: { count: 5, speed: 800 },
        4: { count: 6, speed: 700 },
        5: { count: 7, speed: 600 },
        6: { count: 8, speed: 500 },
        7: { count: 9, speed: 450 },
        8: { count: 10, speed: 400 },
        9: { count: 12, speed: 350 },
        10: { count: 15, speed: 300 },
    };

    startBtn.addEventListener('click', startGame);
    submitBtn.addEventListener('click', checkAnswer);

    function startGame() {
        if (gameInProgress) return;
        gameInProgress = true;

        const level = levelSelect.value;
        const { count, speed } = levelSettings[level];

        setupDiv.classList.add('hidden');
        resultArea.textContent = '';
        answerInput.value = '';
        gameArea.classList.remove('hidden');
        inputArea.classList.add('hidden');

        let numbers = [];
        currentSum = 0;

        for (let i = 0; i < count; i++) {
            const num = Math.floor(Math.random() * 900) + 100; // 3-digit numbers
            numbers.push(num);
            currentSum += num;
        }

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < numbers.length) {
                numberDisplay.textContent = numbers[currentIndex];
                currentIndex++;
            } else {
                clearInterval(interval);
                numberDisplay.textContent = '';
                gameArea.classList.add('hidden');
                inputArea.classList.remove('hidden');
                answerInput.focus();
            }
        }, speed);
    }

    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value, 10);

        if (isNaN(userAnswer)) {
            resultArea.textContent = '数字を入力してください。';
            resultArea.style.color = 'orange';
            return;
        }

        if (userAnswer === currentSum) {
            score += parseInt(levelSelect.value, 10);
            resultArea.textContent = '正解！';
            resultArea.style.color = 'green';
        } else {
            resultArea.textContent = `不正解... 正しい答えは ${currentSum} でした。`;
            resultArea.style.color = 'red';
        }

        scoreSpan.textContent = score;
        gameInProgress = false;
        setupDiv.classList.remove('hidden');
        inputArea.classList.add('hidden');
    }
});
