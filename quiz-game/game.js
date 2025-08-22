const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const resultElement = document.getElementById('result');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 10;
let questions = [];

async function loadQuestions() {
    const response = await fetch('questions.json');
    questions = await response.json();
    showQuestion();
}

function showQuestion() {
    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;

    optionsElement.innerHTML = '';
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => checkAnswer(option));
        optionsElement.appendChild(button);
    });

    nextBtn.style.display = 'none';
    resultElement.textContent = '';
    scoreElement.textContent = `スコア: ${score}`;
    timeLeft = 10;
    timerElement.textContent = `残り時間: ${timeLeft}`;
    startTimer();
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `残り時間: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer(null);
        }
    }, 1000);
}

function checkAnswer(selectedOption) {
    clearInterval(timer);
    const question = questions[currentQuestionIndex];
    if (selectedOption === question.answer) {
        resultElement.textContent = '正解！';
        score++;
    } else if (selectedOption === null) {
        resultElement.textContent = `時間切れ！正解は「${question.answer}」です。`;
    } else {
        resultElement.textContent = `不正解。正解は「${question.answer}」です。`;
    }

    Array.from(optionsElement.children).forEach(button => {
        button.disabled = true;
    });

    nextBtn.style.display = 'block';
    scoreElement.textContent = `スコア: ${score}`;
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        questionElement.textContent = 'クイズ終了！';
        optionsElement.innerHTML = '';
        nextBtn.style.display = 'none';
        resultElement.textContent = `あなたの最終スコアは ${score} / ${questions.length} です。`;
        scoreElement.textContent = '';
        timerElement.textContent = '';
    }
}

nextBtn.addEventListener('click', nextQuestion);

loadQuestions();