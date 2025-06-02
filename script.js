// Questions data structure
const questions = {
    fractions: {
        easy: [
            { question: "Calculate: 2/3 + 1/4", answer: "11/12" },
            { question: "What is 3/5 of 20?", answer: "12" },
            { question: "Simplify: 12/18", answer: "2/3" },
            { question: "Calculate: 7/8 - 1/4", answer: "5/8" },
            // New easy fractions questions
            { question: "What is 1/2 of 50?", answer: "25" },
            { question: "Calculate: 1/5 + 2/5", answer: "3/5" },
            { question: "You have a chocolate bar with 8 squares. You eat 2 squares. What fraction did you eat (simplified)?", answer: "1/4" }
        ],
        medium: [
            // Added unit property, removed from answer
            { question: "A recipe needs 2 1/3 cups of flour. If Sarah wants to make 1 1/2 times the recipe, how much flour does she need?", answer: "3 1/2", unit: "cups" },
            { question: "Calculate: 2/3 × 5/8", answer: "5/12" },
            { question: "What is 3/4 ÷ 2/5?", answer: "1 7/8" }
        ],
        hard: [
            { question: "Solve: x/4 + x/6 = 5", answer: "12" },
            // Modified tank question for simpler numbers and added unit
            { question: "A tank is 1/4 full. After adding 10 litres, it becomes 3/4 full. What is the capacity of the tank?", answer: "20", unit: "litres" },
            { question: "Calculate: (2/3 + 1/4) × 6/11", answer: "1/2" }
        ]
    },
    geometry: {
        easy: [
            { question: "Find the area of a rectangle with length 8cm and width 5cm.", answer: "40", unit: "cm²" },
            { question: "What is the perimeter of a square with sides of 7cm?", answer: "28", unit: "cm" },
            { question: "Find the area of a triangle with base 6cm and height 4cm.", answer: "12", unit: "cm²" },
            { question: "Calculate the circumference of a circle with radius 3cm. (Use π = 3.14)", answer: "18.84", unit: "cm" }
        ],
        medium: [
            { question: "Find the area of a parallelogram with base 12cm and height 8cm.", answer: "96", unit: "cm²" },
            { question: "A circle has a diameter of 14cm. Find its area. (Use π = 3.14)", answer: "153.86", unit: "cm²" },
            { question: "Find the volume of a cuboid with dimensions 6cm × 4cm × 5cm.", answer: "120", unit: "cm³" },
            { question: "In a right-angled triangle, two sides are 3cm and 4cm. Find the length of the hypotenuse.", answer: "5", unit: "cm" }
        ],
        hard: [
            { question: "The area of a circle is 78.5 cm². Find its radius. (Use π = 3.14)", answer: "5", unit: "cm" },
            { question: "A trapezium has parallel sides of lengths 8cm and 12cm, and a height of 5cm. Find its area.", answer: "50", unit: "cm²" },
            { question: "Find the surface area of a cylinder with radius 4cm and height 10cm. (Use π = 3.14)", answer: "351.68", unit: "cm²" },
            // Split the original question into two
            { question: "In triangle ABC, angle A = 40° and angle B = 65°. What is the measure of angle C?", answer: "75", unit: "°" },
            { question: "A triangle has a base of 10cm and a height of 8cm. What is its area?", answer: "40", unit: "cm²" }
        ]
    }
};

// Game state
let currentLevel = 1;
let score = 0;
let currentQuestion = null;
let currentCategory = 'fractions';
let currentDifficulty = 'easy';
let consecutiveCorrect = 0;
let badges = {
    'First Question': false,
    'Perfect Score': false, // Logic for this needs to be at the very end of all questions
    'Math Master': false,
    'Geometry Genius': false,
    'Fractions Expert': false,
    'Streak Master': false
};
let answered = {
    fractions: { easy: [], medium: [], hard: [] },
    geometry: { easy: [], medium: [], hard: [] }
};

// DOM elements
const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer');
const answerUnitElement = document.getElementById('answer-unit'); // For displaying units
const submitButton = document.getElementById('submit');
const feedbackElement = document.getElementById('feedback');
const levelElement = document.getElementById('level');
const scoreElement = document.getElementById('score');
const badgesElement = document.getElementById('badges');
const streakElement = document.getElementById('streak');
const hintButton = document.getElementById('hint');
const categorySelect = document.getElementById('category-select');
const difficultySelect = document.getElementById('difficulty-select');
const levelGoBtn = document.getElementById('level-go');
const resetGameBtn = document.getElementById('reset-game'); // New Reset Button

// Initialize badges display
function initializeBadges() {
    if (!badgesElement) return;
    badgesElement.innerHTML = '';
    Object.keys(badges).forEach(badge => {
        const badgeElement = document.createElement('div');
        badgeElement.className = `badge ${badges[badge] ? 'earned' : ''}`;
        badgeElement.textContent = badge;
        badgesElement.appendChild(badgeElement);
    });
}

// Helper to get unanswered questions
function getUnansweredQuestions() {
    const all = questions[currentCategory][currentDifficulty];
    const ans = answered[currentCategory][currentDifficulty];
    if (!all) return []; // Ensure 'all' exists
    return all.filter((q, i) => !ans[i] || !ans[i].correct);
}

// Render progress bar
function renderProgressBar() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    const all = questions[currentCategory][currentDifficulty];
    const ans = answered[currentCategory][currentDifficulty];
    if (!all) { bar.innerHTML = ''; return; } // Ensure 'all' exists

    bar.innerHTML = '';
    all.forEach((q, i) => {
        const item = document.createElement('div');
        item.className = 'progress-item';
        if (ans[i] && ans[i].correct) item.classList.add('answered');
        else if (ans[i] && !ans[i].correct) item.classList.add('answered-incorrect'); // Optional: style for tried but wrong
        if (currentQuestion && q.question === currentQuestion.question) item.classList.add('current');
        item.textContent = i + 1;
        bar.appendChild(item);
    });
}

// Get next unanswered question
function getNextQuestion() {
    const unanswered = getUnansweredQuestions();
    if (unanswered.length === 0) return null;
    return unanswered[Math.floor(Math.random() * unanswered.length)];
}

// Check if all questions in current set are correct
function allCurrentAnsweredCorrect() {
    const all = questions[currentCategory][currentDifficulty];
    const ans = answered[currentCategory][currentDifficulty];
    if (!all || all.length === 0) return false;
    // Ensure ans array is populated for all questions before checking 'every'
    for (let i = 0; i < all.length; i++) {
        if (!ans[i]) return false; // If any question hasn't been answered at all
    }
    return all.every((q, i) => ans[i] && ans[i].correct);
}

// Move to next difficulty or category
function advanceDifficulty() {
    if (currentDifficulty === 'easy') currentDifficulty = 'medium';
    else if (currentDifficulty === 'medium') currentDifficulty = 'hard';
    else if (currentDifficulty === 'hard' && currentCategory === 'fractions') {
        currentCategory = 'geometry';
        currentDifficulty = 'easy';
    } else {
        return false; // All categories and difficulties completed
    }
    currentLevel += 1;
    saveProgress(); // Save progress when advancing
    return true;
}

let hintLives = 3;
const maxHints = 3;
let currentHintIndex = 0; // Tracks hints used for the *current* question

// Updated Hints
const questionHints = {
    // Fractions Easy
    "Calculate: 2/3 + 1/4": ["Find a common denominator (12). Convert: 8/12 + 3/12.", "8/12 + 3/12 = 11/12"],
    "What is 3/5 of 20?": ["'Of' means multiply: 3/5 × 20.", "(3 × 20) / 5 = 60 / 5 = 12"],
    "Simplify: 12/18": ["Find the GCD of 12 and 18 (it's 6).", "Divide numerator and denominator by 6: (12÷6)/(18÷6) = 2/3"],
    "Calculate: 7/8 - 1/4": ["Common denominator is 8. Convert 1/4 to 2/8.", "7/8 - 2/8 = 5/8"],
    "What is 1/2 of 50?": ["'Of' means multiply. So, 1/2 × 50.", "50 divided by 2 is 25."],
    "Calculate: 1/5 + 2/5": ["The denominators are already the same.", "Add the numerators: (1+2)/5 = 3/5."],
    "You have a chocolate bar with 8 squares. You eat 2 squares. What fraction did you eat (simplified)?": ["The fraction is (squares eaten) / (total squares) = 2/8.", "Simplify 2/8 by dividing the top and bottom by their greatest common divisor (2).", "2/8 = 1/4"],

    // Fractions Medium
    "A recipe needs 2 1/3 cups of flour. If Sarah wants to make 1 1/2 times the recipe, how much flour does she need?": ["Convert to improper fractions: 2 1/3 = 7/3, 1 1/2 = 3/2.", "Multiply: (7/3) × (3/2) = 21/6.", "Simplify 21/6 to 7/2, which is 3 1/2."],
    "Calculate: 2/3 × 5/8": ["Multiply numerators (2×5=10), multiply denominators (3×8=24).", "10/24. Simplify by dividing by 2.", "5/12"],
    "What is 3/4 ÷ 2/5?": ["Multiply by the reciprocal: 3/4 × 5/2.", "(3×5)/(4×2) = 15/8.", "Convert to mixed number: 1 7/8"],

    // Fractions Hard
    "Solve: x/4 + x/6 = 5": ["Common denominator for 4 and 6 is 12. Equation becomes 3x/12 + 2x/12 = 5.", "So, 5x/12 = 5. Multiply by 12: 5x = 60.", "x = 60/5 = 12"],
    "A tank is 1/4 full. After adding 10 litres, it becomes 3/4 full. What is the capacity of the tank?": [
        "The change in fullness is 3/4 - 1/4 = 2/4 = 1/2 of the tank.",
        "This 1/2 of the tank corresponds to 10 litres.",
        "If 1/2 of tank = 10 litres, then the full tank (2/2) is 10 × 2 = 20 litres."
    ],
    "Calculate: (2/3 + 1/4) × 6/11": ["Brackets first: 2/3 + 1/4 = 8/12 + 3/12 = 11/12.", "Now multiply: (11/12) × (6/11).", "You can cancel the 11s. (1/12) × 6 = 6/12, which simplifies to 1/2."],

    // Geometry Easy
    "Find the area of a rectangle with length 8cm and width 5cm.": ["Area = length × width.", "8 × 5 = 40"],
    "What is the perimeter of a square with sides of 7cm?": ["Perimeter = 4 × side length.", "4 × 7 = 28"],
    "Find the area of a triangle with base 6cm and height 4cm.": ["Area = 1/2 × base × height.", "1/2 × 6 × 4 = 12"],
    "Calculate the circumference of a circle with radius 3cm. (Use π = 3.14)": ["Circumference = 2 × π × radius.", "2 × 3.14 × 3 = 18.84"],

    // Geometry Medium
    "Find the area of a parallelogram with base 12cm and height 8cm.": ["Area = base × height.", "12 × 8 = 96"],
    "A circle has a diameter of 14cm. Find its area. (Use π = 3.14)": ["Radius = diameter/2 = 14/2 = 7cm.", "Area = π × radius² = 3.14 × 7².", "3.14 × 49 = 153.86"],
    "Find the volume of a cuboid with dimensions 6cm × 4cm × 5cm.": ["Volume = length × width × height.", "6 × 4 × 5 = 120"],
    "In a right-angled triangle, two sides are 3cm and 4cm. Find the length of the hypotenuse.": ["Use Pythagoras: a² + b² = c².", "3² + 4² = 9 + 16 = 25.", "c = √25 = 5"],

    // Geometry Hard
    "The area of a circle is 78.5 cm². Find its radius. (Use π = 3.14)": ["Area = π × r². So, 78.5 = 3.14 × r².", "r² = 78.5 / 3.14 = 25.", "r = √25 = 5"],
    "A trapezium has parallel sides of lengths 8cm and 12cm, and a height of 5cm. Find its area.": ["Area = 1/2 × (sum of parallel sides) × height.", "1/2 × (8+12) × 5 = 1/2 × 20 × 5.", "10 × 5 = 50"],
    "Find the surface area of a cylinder with radius 4cm and height 10cm. (Use π = 3.14)": ["SA = 2πr² + 2πrh.", "2πr² = 2 × 3.14 × 4² = 100.48.  2πrh = 2 × 3.14 × 4 × 10 = 251.2.", "100.48 + 251.2 = 351.68"],
    "In triangle ABC, angle A = 40° and angle B = 65°. What is the measure of angle C?": ["Sum of angles in a triangle is 180°.", "Angle C = 180° - (Angle A + Angle B).", "C = 180° - (40° + 65°) = 180° - 105° = 75°"],
    "A triangle has a base of 10cm and a height of 8cm. What is its area?": ["Area = 1/2 × base × height.", "1/2 × 10cm × 8cm.", "1/2 × 80cm² = 40cm²"]
};


function resetHintsForNewQuestion() {
    currentHintIndex = 0; // Reset index for hints of the new question
    hintLives = maxHints; // Reset general hint lives
    updateHintButton();
}

function updateHintButton() {
    if (!hintButton) return;
    const hintsAvailableForQuestion = questionHints[currentQuestion?.question]?.length || 0;
    const canUseSpecificHint = currentHintIndex < hintsAvailableForQuestion;
    hintButton.textContent = `Hint (${hintLives} left)`;
    hintButton.disabled = gameComplete || !currentQuestion || hintLives <= 0 || !canUseSpecificHint;
}

function updateStreakDisplay() {
    if (!streakElement) return;
    streakElement.textContent = consecutiveCorrect;
}

let gameComplete = false;

function showNextQuestion() {
    if (allCurrentAnsweredCorrect()) {
        if (!advanceDifficulty()) {
            gameComplete = true;
            if (questionElement) questionElement.textContent = '🎉 You have completed all questions!';
            if (answerInput) answerInput.style.display = 'none';
            if (answerUnitElement) answerUnitElement.style.display = 'none';
            if (submitButton) submitButton.style.display = 'none';
            if (hintButton) hintButton.style.display = 'none';
            if (feedbackElement) feedbackElement.textContent = 'Congratulations!';
            // Check for Perfect Score badge if all questions in the entire game are done
            // This requires a more comprehensive check across all categories/difficulties
            renderProgressBar();
            updateHintButton();
            saveProgress(); // Save final state
            return;
        }
        // New difficulty/category: state already saved in advanceDifficulty
    }

    currentQuestion = getNextQuestion();
    if (!currentQuestion) { // Should be caught by allCurrentAnsweredCorrect or advanceDifficulty
        gameComplete = true; // Or handle as error/end of available questions
        if (questionElement) questionElement.textContent = 'No more questions in this section, or all done!';
        if (answerInput) answerInput.style.display = 'none';
        if (answerUnitElement) answerUnitElement.style.display = 'none';
        if (submitButton) submitButton.style.display = 'none';
        if (hintButton) hintButton.style.display = 'none';
        updateHintButton();
        saveProgress();
        return;
    }

    if (questionElement) questionElement.textContent = currentQuestion.question;
    if (answerInput) {
        answerInput.value = '';
        answerInput.style.display = '';
        answerInput.disabled = false;
        answerInput.focus();
    }
    if (answerUnitElement) { // Display unit if available
        answerUnitElement.textContent = currentQuestion.unit || '';
        answerUnitElement.style.display = currentQuestion.unit ? 'inline-block' : 'none';
        answerUnitElement.classList.add('ml-2', 'text-gray-600', 'dark:text-gray-400'); // Add some Tailwind styling
    }
    if (submitButton) {
        submitButton.style.display = '';
        submitButton.disabled = false;
    }
    if (hintButton) hintButton.style.display = '';
    if (feedbackElement) {
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback p-2 my-2 rounded-md text-sm'; // Base styling
    }

    resetHintsForNewQuestion(); // Reset hints for the new question
    renderProgressBar();
    updateStreakDisplay();
    // saveProgress(); // Save state when a new question is shown
}

function checkAnswer(userAnswer) {
    if (!currentQuestion || gameComplete) return;

    const correctAnswer = currentQuestion.answer.toLowerCase().trim();
    userAnswer = userAnswer.toLowerCase().trim();

    const all = questions[currentCategory][currentDifficulty];
    const idx = all.findIndex(q => q.question === currentQuestion.question);

    if (!answered[currentCategory][currentDifficulty][idx]) {
        answered[currentCategory][currentDifficulty][idx] = { correct: false, attempts: 0 };
    }
    answered[currentCategory][currentDifficulty][idx].attempts++;

    if (userAnswer === correctAnswer) {
        score += 10; // Give more points
        consecutiveCorrect += 1;
        if (feedbackElement) {
            feedbackElement.textContent = 'Correct! 🎉';
            feedbackElement.className = 'feedback p-2 my-2 rounded-md text-sm bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-100';
        }
        answered[currentCategory][currentDifficulty][idx].correct = true;

        if (!badges['First Question']) badges['First Question'] = true;
        if (consecutiveCorrect >= 3 && !badges['Streak Master']) badges['Streak Master'] = true; // Easier streak
        if (score >= 50 && !badges['Math Master']) badges['Math Master'] = true; // Adjusted score threshold

        const currentSet = questions[currentCategory][currentDifficulty];
        const answeredSet = answered[currentCategory][currentDifficulty];
        const allCorrectInCurrentSet = currentSet.every((q, i) => answeredSet[i] && answeredSet[i].correct);

        if (allCorrectInCurrentSet) {
            if (currentCategory === 'geometry' && !badges['Geometry Genius']) badges['Geometry Genius'] = true;
            if (currentCategory === 'fractions' && !badges['Fractions Expert']) badges['Fractions Expert'] = true;
        }

        if (answerInput) answerInput.disabled = true;
        if (submitButton) submitButton.disabled = true;
        setTimeout(() => {
            if (answerInput) answerInput.disabled = false;
            if (submitButton) submitButton.disabled = false;
            showNextQuestion();
        }, 1200);

    } else { // Incorrect answer
        consecutiveCorrect = 0;
        feedbackElement.className = 'feedback p-2 my-2 rounded-md text-sm bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-100';
        const questionSpecificHints = questionHints[currentQuestion.question] || [];

        if (hintLives > 0 && currentHintIndex < questionSpecificHints.length) {
            hintLives--;
            const hintText = questionSpecificHints[currentHintIndex];
            currentHintIndex++;
            feedbackElement.textContent = `Incorrect. Here's a hint: ${hintText}`;
            // User can try again, input remains enabled.
        } else {
            // No hints left (either general hintLives or specific hints for this question)
            const explanation = questionSpecificHints.length > 0
                ? questionSpecificHints[questionSpecificHints.length - 1] // Last available hint as explanation
                : "Please review this topic for a better understanding.";
            feedbackElement.textContent = `Incorrect. The correct answer was: ${currentQuestion.answer}. Explanation: ${explanation}`;

            if (answerInput) answerInput.disabled = true;
            if (submitButton) submitButton.disabled = true;
            setTimeout(() => {
                if (answerInput) answerInput.disabled = false;
                if (submitButton) submitButton.disabled = false;
                showNextQuestion(); // Move to next question after showing explanation
            }, 3500); // Longer delay to read explanation
        }
    }

    if (scoreElement) scoreElement.textContent = score;
    if (levelElement) levelElement.textContent = currentLevel;
    initializeBadges();
    renderProgressBar(); // Update progress bar to show incorrect attempt if not yet correct
    updateHintButton();
    updateStreakDisplay();
    saveProgress();
}

// --- LocalStorage Progress Saving ---
function saveProgress() {
    const progress = {
        score,
        currentLevel,
        badges: { ...badges },
        answered: JSON.parse(JSON.stringify(answered)), // Deep copy
        currentCategory,
        currentDifficulty,
        gameComplete
    };
    localStorage.setItem('mathGameProgress', JSON.stringify(progress));
}

function loadProgress() {
    const savedProgress = localStorage.getItem('mathGameProgress');
    if (savedProgress) {
        try {
            const progress = JSON.parse(savedProgress);
            score = progress.score || 0;
            currentLevel = progress.currentLevel || 1;
            badges = progress.badges || badges; // Keep initial if not saved
            answered = progress.answered || { fractions: { easy: [], medium: [], hard: [] }, geometry: { easy: [], medium: [], hard: [] } };
            currentCategory = progress.currentCategory || 'fractions';
            currentDifficulty = progress.currentDifficulty || 'easy';
            gameComplete = progress.gameComplete || false;

            // Update UI based on loaded progress
            if (scoreElement) scoreElement.textContent = score;
            if (levelElement) levelElement.textContent = currentLevel;
            initializeBadges();
            updateStreakDisplay(); // Streak is not saved, resets per session/load

            if (gameComplete) { // If game was completed, show end state
                if (questionElement) questionElement.textContent = '🎉 You have completed all questions!';
                if (answerInput) answerInput.style.display = 'none';
                if (answerUnitElement) answerUnitElement.style.display = 'none';
                if (submitButton) submitButton.style.display = 'none';
                if (hintButton) hintButton.style.display = 'none';
                if (feedbackElement) feedbackElement.textContent = 'Welcome back! You had completed the game.';
            }
            // showNextQuestion will be called after DOMContentLoaded, which will pick up the loaded state
        } catch (e) {
            console.error("Error loading progress:", e);
            localStorage.removeItem('mathGameProgress'); // Clear corrupted data
        }
    }
}

function resetGameData() {
    score = 0;
    currentLevel = 1;
    consecutiveCorrect = 0;
    currentCategory = 'fractions';
    currentDifficulty = 'easy';
    gameComplete = false;
    badges = Object.fromEntries(Object.keys(badges).map(key => [key, false]));
    answered = {
        fractions: { easy: [], medium: [], hard: [] },
        geometry: { easy: [], medium: [], hard: [] }
    };
    localStorage.removeItem('mathGameProgress');

    // Update UI
    if (scoreElement) scoreElement.textContent = score;
    if (levelElement) levelElement.textContent = currentLevel;
    initializeBadges();
    updateStreakDisplay();
    resetHintsForNewQuestion(); // Also resets general hint lives

    if (answerInput) {
        answerInput.style.display = '';
        answerInput.disabled = false;
    }
    if (submitButton) {
        submitButton.style.display = '';
        submitButton.disabled = false;
    }
    if (hintButton) hintButton.style.display = '';

    showNextQuestion(); // Start with a new question
    if (feedbackElement) feedbackElement.textContent = "Game Reset!";
    setTimeout(() => { if (feedbackElement) feedbackElement.textContent = ""; }, 2000);
}


// Event listeners
if (submitButton) {
    submitButton.addEventListener('click', () => {
        if (answerInput) checkAnswer(answerInput.value);
    });
}
if (answerInput) {
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !answerInput.disabled) {
            checkAnswer(answerInput.value);
        }
    });
}
if (hintButton) {
    hintButton.addEventListener('click', () => {
        if (gameComplete || !currentQuestion || hintLives <= 0) return;

        const questionSpecificHints = questionHints[currentQuestion.question] || [];
        if (currentHintIndex < questionSpecificHints.length) {
            const hintText = questionSpecificHints[currentHintIndex];
            currentHintIndex++; // Consume the hint
            hintLives--; // Use a general hint life

            if (feedbackElement) {
                feedbackElement.textContent = `Hint: ${hintText}`;
                feedbackElement.className = 'feedback p-2 my-2 rounded-md text-sm bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100';
            }
            updateHintButton();
            saveProgress(); // Save hint state indirectly by saving other game progress
        } else {
            if (feedbackElement) {
                feedbackElement.textContent = "No more specific hints for this question.";
                feedbackElement.className = 'feedback p-2 my-2 rounded-md text-sm bg-yellow-100 dark:bg-yellow-700 text-yellow-700 dark:text-yellow-100';
            }
        }
    });
}
if (levelGoBtn) {
    levelGoBtn.addEventListener('click', () => {
        if (categorySelect) currentCategory = categorySelect.value;
        if (difficultySelect) currentDifficulty = difficultySelect.value;

        // Reset parts of game state for the new selection, but keep overall score/badges
        currentLevel = 1; // This might need adjustment if levels are continuous
        // score = 0; // Don't reset score when just changing level/category
        // hintLives = maxHints; // Resets with new question
        consecutiveCorrect = 0;
        gameComplete = false; 

        // Don't reset 'answered' for other categories/difficulties, only current if desired
        // For now, jumping levels doesn't reset 'answered' for previous ones.
        // answered[currentCategory][currentDifficulty] = []; // Option to reset current set

        if (answerInput) answerInput.style.display = '';
        if (submitButton) submitButton.style.display = '';
        if (hintButton) hintButton.style.display = '';
        // if (scoreElement) scoreElement.textContent = score; // Score persists
        if (levelElement) levelElement.textContent = currentLevel;

        resetHintsForNewQuestion();
        updateStreakDisplay();
        showNextQuestion();
        saveProgress(); // Save after changing category/difficulty
    });
}
if (resetGameBtn) {
    resetGameBtn.addEventListener('click', resetGameData);
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    loadProgress(); // Load progress first
    initializeBadges(); // Then initialize UI elements
    updateStreakDisplay();
    updateHintButton(); // Initial state of hint button

    if (!gameComplete) { // Only show a new question if game wasn't loaded as complete
        showNextQuestion();
    } else { // If game was loaded as complete, ensure UI reflects this
        if (questionElement) questionElement.textContent = '🎉 You have completed all questions!';
        if (answerInput) answerInput.style.display = 'none';
        if (answerUnitElement) answerUnitElement.style.display = 'none';
        if (submitButton) submitButton.style.display = 'none';
        if (hintButton) hintButton.style.display = 'none';
        if (feedbackElement && feedbackElement.textContent === '') feedbackElement.textContent = 'Welcome back! You had completed the game.';
        renderProgressBar(); // Render progress even if complete
    }
});
