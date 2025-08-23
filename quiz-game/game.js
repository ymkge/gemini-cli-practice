document.addEventListener('DOMContentLoaded', () => {
    const questionElement = document.getElementById('question');
    const choicesElement = document.getElementById('choices');
    const resultContainer = document.getElementById('result-container');
    const scoreElement = document.getElementById('score');
    const restartBtn = document.getElementById('restart-btn');
    const exitBtn = document.getElementById('exit-btn');
    const quizContainer = document.getElementById('quiz-container');
    const questionNumberElement = document.getElementById('question-number');
    const currentScoreElement = document.getElementById('current-score');
    const progressBar = document.getElementById('progress-bar');

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedQuestions = [];

    async function fetchQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            questions = data;
            startGame();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
            questionElement.textContent = 'Failed to load questions. Please refresh the page.';
        }
    }

    function startGame() {
        score = 0;
        currentQuestionIndex = 0;
        resultContainer.classList.add('hidden');
        quizContainer.classList.remove('hidden');
        selectedQuestions = getRandomQuestions(questions, 5);
        updateProgress();
        displayQuestion();
    }

    function getRandomQuestions(allQuestions, numQuestions) {
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numQuestions);
    }

    function displayQuestion() {
        if (currentQuestionIndex < selectedQuestions.length) {
            const currentQuestion = selectedQuestions[currentQuestionIndex];
            questionElement.textContent = currentQuestion.question;
            choicesElement.innerHTML = '';
            currentQuestion.choices.forEach(choice => {
                const button = document.createElement('button');
                button.textContent = choice;
                button.classList.add('choice-btn');
                button.addEventListener('click', () => selectAnswer(choice, button));
                choicesElement.appendChild(button);
            });
        } else {
            showResult();
        }
    }

    function selectAnswer(selectedChoice, button) {
        const currentQuestion = selectedQuestions[currentQuestionIndex];
        const buttons = choicesElement.querySelectorAll('.choice-btn');
        buttons.forEach(btn => btn.disabled = true);

        if (selectedChoice === currentQuestion.answer) {
            score += 20;
            button.classList.add('correct');
        } else {
            button.classList.add('incorrect');
            buttons.forEach(btn => {
                if (btn.textContent === currentQuestion.answer) {
                    btn.classList.add('correct');
                }
            });
        }

        setTimeout(() => {
            currentQuestionIndex++;
            updateProgress();
            displayQuestion();
        }, 1200);
    }

    function showResult() {
        quizContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        scoreElement.textContent = score;
    }

    function updateProgress() {
        const progressPercentage = (currentQuestionIndex / selectedQuestions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        if (currentQuestionIndex < selectedQuestions.length) {
            questionNumberElement.textContent = currentQuestionIndex + 1;
        }
        currentScoreElement.textContent = score;
    }

    restartBtn.addEventListener('click', startGame);
    exitBtn.addEventListener('click', showResult);

    fetchQuestions();
});