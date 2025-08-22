document.addEventListener('DOMContentLoaded', () => {
    const questionElement = document.getElementById('question');
    const choicesElement = document.getElementById('choices');
    const resultContainer = document.getElementById('result-container');
    const scoreElement = document.getElementById('score');
    const restartBtn = document.getElementById('restart-btn');
    const exitBtn = document.getElementById('exit-btn');
    const questionContainer = document.getElementById('question-container');
    const questionNumberElement = document.getElementById('question-number');
    const currentScoreElement = document.getElementById('current-score');

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
            questionElement.textContent = '問題の読み込みに失敗しました。ページをリロードしてください。';
        }
    }

    function startGame() {
        score = 0;
        currentQuestionIndex = 0;
        resultContainer.classList.add('hidden');
        questionContainer.classList.remove('hidden');
        exitBtn.classList.remove('hidden');
        selectedQuestions = getRandomQuestions(questions, 5);
        updateProgress();
        displayQuestion();
    }

    function getRandomQuestions(allQuestions, numQuestions) {
        const shuffled = [...allQuestions];
        let currentIndex = shuffled.length;
        let randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [shuffled[currentIndex], shuffled[randomIndex]] = [
                shuffled[randomIndex], shuffled[currentIndex]];
        }

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
            score += 20; // 1問あたり20点
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
        }, 1500);
    }

    function showResult() {
        questionContainer.classList.add('hidden');
        exitBtn.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        scoreElement.textContent = score;
    }

    function updateProgress() {
        if (currentQuestionIndex < selectedQuestions.length) {
            questionNumberElement.textContent = currentQuestionIndex + 1;
        }
        currentScoreElement.textContent = score;
    }

    restartBtn.addEventListener('click', startGame);
    exitBtn.addEventListener('click', showResult);

    fetchQuestions();
});
