document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const config = {
        QUESTIONS_URL: 'questions.json',
        NUM_QUESTIONS: 5,
        SCORE_PER_QUESTION: 20,
        ANSWER_DELAY_MS: 1200,
    };

    // --- DOM ELEMENTS ---
    const dom = {
        quizContainer: document.getElementById('quiz-container'),
        resultContainer: document.getElementById('result-container'),
        question: document.getElementById('question'),
        choices: document.getElementById('choices'),
        finalScore: document.getElementById('score'),
        restartBtn: document.getElementById('restart-btn'),
        exitBtn: document.getElementById('exit-btn'),
        questionNumber: document.getElementById('question-number'),
        currentScore: document.getElementById('current-score'),
        progressBar: document.getElementById('progress-bar'),
    };

    // --- GAME STATE ---
    const state = {
        allQuestions: [],
        selectedQuestions: [],
        currentQuestionIndex: 0,
        score: 0,
    };

    // --- FUNCTIONS ---

    /**
     * Fetches questions from the specified URL and starts the game.
     */
    async function initGame() {
        try {
            const response = await fetch(config.QUESTIONS_URL);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            state.allQuestions = await response.json();
            startGame();
        } catch (error) {
            console.error('Failed to load questions:', error);
            dom.question.textContent = 'Failed to load questions. Please check the console or refresh the page.';
        }
    }

    /**
     * Resets the game state and starts a new quiz.
     */
    function startGame() {
        state.score = 0;
        state.currentQuestionIndex = 0;
        state.selectedQuestions = getRandomQuestions(state.allQuestions, config.NUM_QUESTIONS);

        dom.resultContainer.classList.add('hidden');
        dom.quizContainer.classList.remove('hidden');

        updateProgress();
        displayQuestion();
    }

    /**
     * Shuffles and selects a random subset of questions.
     * @param {Array} allQuestions - The array of all available questions.
     * @param {number} numQuestions - The number of questions to select.
     * @returns {Array} A new array with the selected questions.
     */
    function getRandomQuestions(allQuestions, numQuestions) {
        return [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, numQuestions);
    }

    /**
     * Displays the current question and its choices.
     */
    function displayQuestion() {
        if (state.currentQuestionIndex < state.selectedQuestions.length) {
            const currentQuestion = state.selectedQuestions[state.currentQuestionIndex];
            dom.question.textContent = currentQuestion.question;
            renderChoices(currentQuestion.choices);
        } else {
            showResult();
        }
    }

    /**
     * Renders the answer choice buttons.
     * @param {Array<string>} choices - The array of choices for the current question.
     */
    function renderChoices(choices) {
        dom.choices.innerHTML = '';
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.classList.add('choice-btn');
            button.addEventListener('click', () => handleAnswerSelection(choice, button));
            dom.choices.appendChild(button);
        });
    }

    /**
     * Handles the user's answer selection.
     * @param {string} selectedChoice - The choice selected by the user.
     * @param {HTMLButtonElement} button - The button element that was clicked.
     */
    function handleAnswerSelection(selectedChoice, button) {
        const currentQuestion = state.selectedQuestions[state.currentQuestionIndex];
        const isCorrect = selectedChoice === currentQuestion.answer;

        updateScore(isCorrect);
        styleSelectedAnswer(button, isCorrect);

        setTimeout(() => {
            state.currentQuestionIndex++;
            updateProgress();
            displayQuestion();
        }, config.ANSWER_DELAY_MS);
    }

    /**
     * Updates the score if the answer is correct.
     * @param {boolean} isCorrect - Whether the selected answer was correct.
     */
    function updateScore(isCorrect) {
        if (isCorrect) {
            state.score += config.SCORE_PER_QUESTION;
        }
    }

    /**
     * Styles the selected answer and reveals the correct answer.
     * @param {HTMLButtonElement} selectedButton - The button the user clicked.
     * @param {boolean} isCorrect - Whether the selected answer was correct.
     */
    function styleSelectedAnswer(selectedButton, isCorrect) {
        const currentQuestion = state.selectedQuestions[state.currentQuestionIndex];
        const buttons = dom.choices.querySelectorAll('.choice-btn');

        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === currentQuestion.answer) {
                btn.classList.add('correct');
            }
        });

        if (!isCorrect) {
            selectedButton.classList.add('incorrect');
        }
    }

    /**
     * Displays the final result screen.
     */
    function showResult() {
        dom.quizContainer.classList.add('hidden');
        dom.resultContainer.classList.remove('hidden');
        dom.finalScore.textContent = state.score;
    }

    /**
     * Updates the progress bar and text indicators.
     */
    function updateProgress() {
        const progressPercentage = (state.currentQuestionIndex / state.selectedQuestions.length) * 100;
        dom.progressBar.style.width = `${progressPercentage}%`;

        if (state.currentQuestionIndex < state.selectedQuestions.length) {
            dom.questionNumber.textContent = state.currentQuestionIndex + 1;
        }
        dom.currentScore.textContent = state.score;
    }

    // --- EVENT LISTENERS ---
    dom.restartBtn.addEventListener('click', startGame);
    dom.exitBtn.addEventListener('click', showResult);

    // --- INITIALIZATION ---
    initGame();
});
