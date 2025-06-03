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
    'Streak Master': false,
    'Fractions Novice': false,
    'Fractions Adept': false,
    'Geometry Novice': false,
    'Geometry Adept': false
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
const themeToggle = document.getElementById('theme-toggle');
const bodyElement = document.body;
const levelDisplayElement = document.getElementById('level-display');
const confettiCanvas = document.getElementById('confetti-canvas');

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
    bar.innerHTML = '';

    if (questionsForCurrentSet.length === 0 && !gameComplete) {
        // Still show 3 placeholders if level is about to start or in transition
        for (let i = 0; i < 3; i++) {
            const item = document.createElement('div');
            item.className = 'progress-item';
            item.textContent = i + 1;
            bar.appendChild(item);
        }
        return;
    }
    if (gameComplete && questionsForCurrentSet.length === 0) {
        // Potentially show all levels as completed, or a summary.
        // For now, if game is complete and no current set, clear bar or show generic complete.
        bar.innerHTML = "<p style='color: var(--text-color);'>All Levels Done!</p>";
        return;
    }

    for (let i = 0; i < questionsForCurrentSet.length; i++) {
        const item = document.createElement('div');
        item.className = 'progress-item';
        const qData = questionsForCurrentSet[i]; // qData is the question object itself

        // We need to track attempt/correctness for these 3 questions specifically for the progress bar
        // Let's assume qData gets a temporary status like qData.attemptedCorrectly for this set.
        if (qData.attemptedInSet) {
            if (qData.answeredCorrectlyInSet) {
                item.classList.add('answered');
            } else {
                item.classList.add('answered-incorrect');
            }
        }
        if (i === currentQuestionInSetIndex && !gameComplete) {
            item.classList.add('current');
        }
        item.textContent = i + 1;
        bar.appendChild(item);
    }
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
    "Calculate: 2/3 + 1/4": ["Find a common denominator. The LCM of 3 and 4 is 12.", "Convert fractions: 2/3 = 8/12 and 1/4 = 3/12.", "Add the numerators: 8/12 + 3/12 = 11/12."],
    "What is 3/5 of 20?": ["The word 'of' means multiply. So, the problem is 3/5 × 20.", "You can write 20 as 20/1. Then multiply: (3 × 20) / (5 × 1) = 60/5.", "Simplify the fraction: 60 ÷ 5 = 12."],
    "Simplify: 12/18": ["Find the greatest common divisor (GCD) of 12 and 18.", "The GCD of 12 and 18 is 6.", "Divide both the numerator and the denominator by 6: (12÷6)/(18÷6) = 2/3."],
    "Calculate: 7/8 - 1/4": ["Find a common denominator. The LCM of 8 and 4 is 8.", "Convert 1/4 to eighths: 1/4 = 2/8.", "Subtract the numerators: 7/8 - 2/8 = 5/8."],
    "What is 1/2 of 50?": ["'Of' means multiply. So, this is 1/2 × 50.", "Multiply 1 by 50 (which is 50), and keep the denominator 2. So, 50/2.", "50 divided by 2 is 25."],
    "Calculate: 1/5 + 2/5": ["The denominators are already the same (5).", "When denominators are the same, just add the numerators.", "(1+2)/5 = 3/5."],
    "You have a chocolate bar with 8 squares. You eat 2 squares. What fraction did you eat (simplified)?": ["The fraction is (squares eaten) / (total squares) = 2/8.", "To simplify, find the greatest common divisor (GCD) of 2 and 8.", "The GCD is 2. Divide numerator and denominator by 2: (2÷2)/(8÷2) = 1/4."],

    // Fractions Medium
    "A recipe needs 2 1/3 cups of flour. If Sarah wants to make 1 1/2 times the recipe, how much flour does she need?": ["Convert mixed numbers to improper fractions. 2 1/3 = (2*3+1)/3 = 7/3.  1 1/2 = (1*2+1)/2 = 3/2.", "Multiply the improper fractions: (7/3) × (3/2).", "Multiply numerators (7×3=21) and denominators (3×2=6) to get 21/6 cups.", "Simplify 21/6. Both are divisible by 3: (21÷3)/(6÷3) = 7/2 cups. Convert to mixed number: 3 1/2 cups."],
    "Calculate: 2/3 × 5/8": ["To multiply fractions, multiply the numerators together and the denominators together.", "Numerators: 2 × 5 = 10.", "Denominators: 3 × 8 = 24.", "The result is 10/24. Simplify this fraction by dividing numerator and denominator by their GCD (2). Answer: 5/12."],
    "What is 3/4 ÷ 2/5?": ["To divide by a fraction, multiply by its reciprocal.", "The reciprocal of 2/5 is 5/2.", "So, the problem becomes 3/4 × 5/2.", "Multiply numerators (3×5=15) and denominators (4×2=8): 15/8. Convert to mixed number: 1 7/8."],

    // Fractions Hard
    "Solve: x/4 + x/6 = 5": ["Find a common denominator for 4 and 6. The LCM is 12.", "Rewrite the equation with the common denominator: (3x/12) + (2x/12) = 5.", "Combine the fractions: 5x/12 = 5.", "Multiply both sides by 12: 5x = 60.", "Solve for x: x = 60/5 = 12."],
    "A tank is 1/4 full. After adding 10 litres, it becomes 3/4 full. What is the capacity of the tank?": [
        "First, find the fraction of the tank that was filled by the 10 litres.",
        "Change in fullness = (New fraction) - (Old fraction) = 3/4 - 1/4 = 2/4.",
        "Simplify the fraction: 2/4 = 1/2. So, 1/2 of the tank was filled by 10 litres.",
        "If 1/2 of the tank is 10 litres, the full capacity (2/2 or whole tank) is 10 litres × 2 = 20 litres."
    ],
    "Calculate: (2/3 + 1/4) × 6/11": ["First, solve the operation inside the parentheses: 2/3 + 1/4.",
        "Common denominator for 2/3 and 1/4 is 12. So, 8/12 + 3/12 = 11/12.",
        "Now the problem is (11/12) × (6/11).",
        "Multiply numerators and denominators: (11×6)/(12×11). You can cancel the 11s.",
        "This simplifies to 6/12, which further simplifies to 1/2."],

    // Geometry Easy
    "Find the area of a rectangle with length 8cm and width 5cm.": ["The formula for the area of a rectangle is Length × Width.", "Area = 8 cm × 5 cm.", "8 × 5 = 40. The unit is cm² because area is a 2D measure. Answer: 40 cm²."],
    "What is the perimeter of a square with sides of 7cm?": ["The perimeter is the total length of all sides. A square has 4 equal sides.", "Perimeter = 4 × side length.", "Perimeter = 4 × 7 cm = 28 cm."],
    "Find the area of a triangle with base 6cm and height 4cm.": ["The formula for the area of a triangle is 1/2 × base × height.", "Area = 1/2 × 6 cm × 4 cm.", "Area = 1/2 × 24 cm² = 12 cm²."],
    "Calculate the circumference of a circle with radius 3cm. (Use π = 3.14)": ["The formula for circumference is 2 × π × radius (or π × diameter).", "Circumference = 2 × 3.14 × 3 cm.", "2 × 3.14 = 6.28. Then, 6.28 × 3 cm = 18.84 cm."],

    // Geometry Medium
    "Find the area of a parallelogram with base 12cm and height 8cm.": ["The formula for the area of a parallelogram is base × height.", "Area = 12 cm × 8 cm.", "12 × 8 = 96. The unit is cm². Answer: 96 cm²."],
    "A circle has a diameter of 14cm. Find its area. (Use π = 3.14)": ["First, find the radius from the diameter. Radius = Diameter / 2.", "Radius = 14 cm / 2 = 7 cm.", "The formula for the area of a circle is π × radius².", "Area = 3.14 × (7 cm)² = 3.14 × 49 cm².", "3.14 × 49 = 153.86. Answer: 153.86 cm²."],
    "Find the volume of a cuboid with dimensions 6cm × 4cm × 5cm.": ["The formula for the volume of a cuboid is Length × Width × Height.", "Volume = 6 cm × 4 cm × 5 cm.", "6 × 4 = 24. Then, 24 × 5 = 120. The unit is cm³ because volume is a 3D measure. Answer: 120 cm³."],
    "In a right-angled triangle, two sides are 3cm and 4cm. Find the length of the hypotenuse.": ["Use the Pythagorean theorem: a² + b² = c², where c is the hypotenuse.", "Let a = 3 cm and b = 4 cm. So, (3cm)² + (4cm)² = c².", "9 cm² + 16 cm² = c²  =>  25 cm² = c².", "c = √25cm² = 5 cm."],

    // Geometry Hard
    "The area of a circle is 78.5 cm². Find its radius. (Use π = 3.14)": [
        "The formula for area is A = π × r².",
        "We have A = 78.5 cm² and π = 3.14. So, 78.5 = 3.14 × r².",
        "To find r², divide the area by π: r² = 78.5 cm² / 3.14.",
        "r² = 25 cm². Now take the square root to find r.",
        "r = √25cm² = 5 cm."
    ],
    "A trapezium has parallel sides of lengths 8cm and 12cm, and a height of 5cm. Find its area.": [
        "The formula for the area of a trapezium is 1/2 × (sum of parallel sides) × height.",
        "Let the parallel sides be a and b. So, a = 8 cm and b = 12 cm. Height h = 5 cm.",
        "Sum of parallel sides = a + b = 8 cm + 12 cm = 20 cm.",
        "Area = 1/2 × 20 cm × 5 cm.",
        "Area = 10 cm × 5 cm = 50 cm²."
    ],
    "Find the surface area of a cylinder with radius 4cm and height 10cm. (Use π = 3.14)": [
        "The surface area (SA) of a cylinder = (Area of two circular bases) + (Area of the curved side).",
        "Area of one circular base = π × r². So, two bases = 2πr².",
        "Area of the curved side = Circumference × height = 2πrh.",
        "SA = 2πr² + 2πrh = 2 × 3.14 × (4cm)² + 2 × 3.14 × 4cm × 10cm.",
        "2πr² = 2 × 3.14 × 16cm² = 100.48 cm².  2πrh = 2 × 3.14 × 40cm² = 251.2 cm².",
        "Total SA = 100.48 cm² + 251.2 cm² = 351.68 cm²."
    ],
    "In triangle ABC, angle A = 40° and angle B = 65°. What is the measure of angle C?": [
        "The sum of all interior angles in any triangle is always 180°.",
        "So, Angle A + Angle B + Angle C = 180°.",
        "40° + 65° + Angle C = 180°.",
        "105° + Angle C = 180°.",
        "Angle C = 180° - 105° = 75°."
    ],
    "A triangle has a base of 10cm and a height of 8cm. What is its area?": [
        "The formula for the area of a triangle is 1/2 × base × height.",
        "Given: base = 10 cm, height = 8 cm.",
        "Area = 1/2 × 10 cm × 8 cm.",
        "Area = 1/2 × 80 cm² = 40 cm²."
    ]
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

// Function to apply the saved theme or default to light
function applyTheme(theme) {
    if (theme === 'dark') {
        bodyElement.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
    } else {
        bodyElement.classList.remove('dark-mode');
        if (themeToggle) themeToggle.checked = false;
    }
}

// Function to handle theme toggle clicks
function handleThemeToggle() {
    if (themeToggle.checked) {
        bodyElement.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        bodyElement.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Event listener for the theme toggle
if (themeToggle) {
    themeToggle.addEventListener('change', handleThemeToggle);
}

// --- Modify your existing DOMContentLoaded listener or add one --- 
// Make sure the theme is applied after loading game progress
document.addEventListener('DOMContentLoaded', () => {
    loadProgress(); // Your existing function

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // If no theme is saved, check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light'); // Default to light
        }
    }
    // Add listener for changes in system preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const newColorScheme = e.matches ? "dark" : "light";
        applyTheme(newColorScheme);
        // Optionally, update localStorage here if you want system changes to override user choice
        // localStorage.setItem('theme', newColorScheme);
    });

    initializeBadges();
    updateStreakDisplay();
    updateHintButton();

    if (!gameComplete) {
        showNextQuestion();
    } else {
        if (questionElement) questionElement.textContent = '🎉 You have completed all questions!';
        if (answerInput) answerInput.style.display = 'none';
        if (answerUnitElement) answerUnitElement.style.display = 'none';
        if (submitButton) submitButton.style.display = 'none';
        if (hintButton) hintButton.style.display = 'none';
        if (feedbackElement && feedbackElement.textContent === '') feedbackElement.textContent = 'Welcome back! You had completed the game.';
        renderProgressBar();
    }
});

// --- NEW GAME STRUCTURE & STATE ---
const gameLevels = [
    { name: "Fractions Easy", category: "fractions", difficulty: "easy", questionsToPick: 3, badgeUnlock: "Fractions Novice" },
    { name: "Fractions Medium", category: "fractions", difficulty: "medium", questionsToPick: 3, badgeUnlock: "Fractions Adept" },
    { name: "Fractions Hard", category: "fractions", difficulty: "hard", questionsToPick: 3, badgeUnlock: "Fractions Expert" }, // Existing badge
    { name: "Geometry Easy", category: "geometry", difficulty: "easy", questionsToPick: 3, badgeUnlock: "Geometry Novice" },
    { name: "Geometry Medium", category: "geometry", difficulty: "medium", questionsToPick: 3, badgeUnlock: "Geometry Adept" },
    { name: "Geometry Hard", category: "geometry", difficulty: "hard", questionsToPick: 3, badgeUnlock: "Geometry Genius" } // Existing badge
];
let currentGlobalLevelIndex = 0;
let questionsForCurrentSet = [];
let questionsAttemptedInSet = 0;
let questionsCorrectInSet = 0;
let currentQuestionInSetIndex = 0; // To track which of the 3 questions is current

// --- CORE GAME FLOW REFACTOR ---
function startGlobalLevel() {
    if (currentGlobalLevelIndex >= gameLevels.length) {
        handleGameWon();
        return;
    }

    const levelData = gameLevels[currentGlobalLevelIndex];
    currentCategory = levelData.category;
    currentDifficulty = levelData.difficulty;

    if (levelDisplayElement) {
        levelDisplayElement.textContent = `Level ${currentGlobalLevelIndex + 1}: ${levelData.name}`;
    }

    // Select 3 unique random questions
    const allQuestionsInLevel = questions[currentCategory][currentDifficulty];
    if (!allQuestionsInLevel || allQuestionsInLevel.length === 0) {
        console.error(`No questions found for ${currentCategory} - ${currentDifficulty}`);
        // Skip to next level or handle error
        currentGlobalLevelIndex++;
        startGlobalLevel();
        return;
    }
    // Shuffle and pick
    const shuffled = [...allQuestionsInLevel].sort(() => 0.5 - Math.random());
    questionsForCurrentSet = shuffled.slice(0, levelData.questionsToPick);
    // Clear previous attempt statuses from these question objects if they persist across playthroughs
    questionsForCurrentSet.forEach(q => {
        delete q.attemptedInSet;
        delete q.answeredCorrectlyInSet;
    });

    questionsAttemptedInSet = 0;
    questionsCorrectInSet = 0;
    currentQuestionInSetIndex = 0;
    gameComplete = false; // Reset gameComplete flag if restarting a level or starting a new one

    // Ensure UI is ready for a new level/set
    if (answerInput) answerInput.style.display = '';
    if (submitButton) submitButton.style.display = '';
    if (hintButton) hintButton.style.display = '';
    if (answerInput) answerInput.disabled = false;
    if (submitButton) submitButton.disabled = false;

    displayQuestionFromSet();
    resetHintsForNewQuestion(); // Resets hint availability for the new question
    updateStreakDisplay(); // Streak might reset per level or continue; current logic resets it.
    // saveProgress(); // Save at the start of a new global level
}

function displayQuestionFromSet() {
    if (currentQuestionInSetIndex >= questionsForCurrentSet.length) {
        // This case should ideally be handled by checkAnswer after 3 attempts
        console.warn("Attempted to display question beyond current set length.");
        return;
    }
    currentQuestion = questionsForCurrentSet[currentQuestionInSetIndex];

    if (questionElement) questionElement.textContent = currentQuestion.question;
    if (answerInput) answerInput.value = '';
    if (answerUnitElement) {
        answerUnitElement.textContent = currentQuestion.unit || '';
        answerUnitElement.style.display = currentQuestion.unit ? 'inline-block' : 'none';
    }
    if (feedbackElement) {
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback p-2 my-2 rounded-md text-sm';
    }
    if (answerInput) answerInput.focus();

    renderProgressBar();
    updateHintButton(); // Update hint button based on the new question and remaining lives
    resetHintsForNewQuestion(); // Ensure currentHintIndex for *specific question hints* is reset
}

function checkAnswer(userAnswer) {
    if (!currentQuestion || gameComplete) return;

    const correctAnswer = currentQuestion.answer.toLowerCase().trim();
    userAnswer = userAnswer.toLowerCase().trim();

    // Mark in overall answered structure (for potential review mode/perfect score later)
    const allQuestionsInCategory = questions[currentCategory][currentDifficulty];
    const overallQuestionIndex = allQuestionsInCategory.findIndex(q => q.question === currentQuestion.question);
    if (overallQuestionIndex !== -1) {
        if (!answered[currentCategory][currentDifficulty][overallQuestionIndex]) {
            answered[currentCategory][currentDifficulty][overallQuestionIndex] = { correct: false, attempts: 0 };
        }
        answered[currentCategory][currentDifficulty][overallQuestionIndex].attempts++;
    }

    currentQuestion.attemptedInSet = true; // Mark for progress bar
    if (userAnswer === correctAnswer) {
        score += 10;
        consecutiveCorrect++;
        questionsCorrectInSet++;
        currentQuestion.answeredCorrectlyInSet = true; // Mark for progress bar
        if (answered[currentCategory][currentDifficulty][overallQuestionIndex]) {
            answered[currentCategory][currentDifficulty][overallQuestionIndex].correct = true;
        }

        if (feedbackElement) {
            feedbackElement.textContent = 'Correct! 🎉';
            feedbackElement.className = 'feedback p-2 my-2 rounded-md text-sm bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-100';
        }
        if (!badges['First Question']) badges['First Question'] = true;
        if (consecutiveCorrect >= 3 && !badges['Streak Master']) badges['Streak Master'] = true;

    } else { // Incorrect Answer
        consecutiveCorrect = 0;
        currentQuestion.answeredCorrectlyInSet = false; // Mark for progress bar
        if (feedbackElement) {
            feedbackElement.textContent = `Incorrect. The correct answer was: ${currentQuestion.answer}.`;
            feedbackElement.className = 'feedback p-2 my-2 rounded-md text-sm bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-100';
        }
        // No hint given automatically on wrong answer here, user must click hint button.
    }

    questionsAttemptedInSet++;
    // Update score, badges, streak display immediately
    if (scoreElement) scoreElement.textContent = score;
    initializeBadges(); // This will check new level-based badges if criteria met elsewhere
    updateStreakDisplay();
    renderProgressBar(); // Update progress bar after attempt

    // Disable input until next question or level decision
    if (answerInput) answerInput.disabled = true;
    if (submitButton) submitButton.disabled = true;

    setTimeout(() => {
        if (answerInput) answerInput.disabled = false;
        if (submitButton) submitButton.disabled = false;

        if (questionsAttemptedInSet >= questionsForCurrentSet.length) { // All 3 questions in set attempted
            if (questionsCorrectInSet === questionsForCurrentSet.length) { // Level Beaten!
                const levelData = gameLevels[currentGlobalLevelIndex];
                if (levelData.badgeUnlock && !badges[levelData.badgeUnlock]) {
                    badges[levelData.badgeUnlock] = true;
                    initializeBadges(); // Re-render badges
                    // Announce badge? feedbackElement.textContent = `Badge Unlocked: ${levelData.badgeUnlock}!`;
                }
                triggerConfetti(); // Phase 2
                if (feedbackElement) feedbackElement.textContent = `Level Complete! ${levelData.name} cleared!`;
                currentGlobalLevelIndex++;
                saveProgress(); // Save after successfully completing a global level
                setTimeout(startGlobalLevel, 2500); // Delay before starting next level
            } else { // Level Failed for this set
                if (feedbackElement) feedbackElement.textContent = `You got ${questionsCorrectInSet} of ${questionsForCurrentSet.length} correct. Let's try this level again!`;
                // Do not save progress if level failed, player will retry
                setTimeout(startGlobalLevel, 2500); // Restart current level with new questions
            }
        } else { // More questions in this set
            currentQuestionInSetIndex++;
            displayQuestionFromSet();
            // saveProgress(); // Or save progress after each question attempt
        }
    }, 1500); // Delay for user to see feedback
}

function handleGameWon() {
    gameComplete = true;
    if (questionElement) questionElement.textContent = '🎉 Congratulations! You have completed all levels!';
    if (answerInput) answerInput.style.display = 'none';
    if (answerUnitElement) answerUnitElement.style.display = 'none';
    if (submitButton) submitButton.style.display = 'none';
    if (hintButton) hintButton.style.display = 'none';
    if (feedbackElement) feedbackElement.textContent = 'Amazing job! You are a Math Master!';
    if (!badges['Math Master']) {
        badges['Math Master'] = true;
        initializeBadges();
    }
    renderProgressBar(); // Show final state
    triggerConfetti();
    saveProgress(); // Save final game won state
}

// --- Confetti Placeholder ---
function triggerConfetti() {
    console.log("CONFETTI! 🎉"); // Placeholder
    if (confettiCanvas) {
        confettiCanvas.style.display = 'block';
        // Basic confetti logic (example)
        const ctx = confettiCanvas.getContext('2d');
        const W = window.innerWidth;
        const H = window.innerHeight;
        confettiCanvas.width = W;
        confettiCanvas.height = H;
        let particles = [];
        for (let i = 0; i < 250; i++) {
            particles.push({
                x: Math.random() * W, y: Math.random() * H * 0.5, r: Math.random() * 5 + 2,
                d: Math.random() * 250, //density
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngle: 0, tiltAngleIncrement: Math.random() * 0.07 + 0.05
            });
        }
        let animationFrameId;
        function drawConfetti() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach((p, i) => {
                ctx.beginPath();
                ctx.lineWidth = p.r / 2;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
                ctx.stroke();
                p.tiltAngle += p.tiltAngleIncrement;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.tilt = Math.sin(p.tiltAngle - i / 8) * 15;
                if (p.y > H) particles[i] = { x: Math.random() * W, y: -20, r: p.r, d: p.d, color: p.color, tilt: p.tilt, tiltAngle: p.tiltAngle, tiltAngleIncrement: p.tiltAngleIncrement };
            });
            animationFrameId = requestAnimationFrame(drawConfetti);
        }
        drawConfetti();
        setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            confettiCanvas.style.display = 'none';
        }, 4000); // Confetti for 4 seconds
    }
}

// --- LOCALSTORAGE ADAPTATION (Ensure currentGlobalLevelIndex is saved/loaded) ---
function saveProgress() {
    const progress = {
        score, badges: { ...badges }, answered: JSON.parse(JSON.stringify(answered)),
        currentGlobalLevelIndex, // Save current global level
        gameComplete
        // currentCategory & currentDifficulty are now derived from currentGlobalLevelIndex
    };
    localStorage.setItem('mathGameProgress', JSON.stringify(progress));
}

function loadProgress() {
    const savedProgress = localStorage.getItem('mathGameProgress');
    if (savedProgress) {
        try {
            const progress = JSON.parse(savedProgress);
            score = progress.score || 0;
            badges = progress.badges || badges;
            answered = progress.answered || { fractions: { easy: [], medium: [], hard: [] }, geometry: { easy: [], medium: [], hard: [] } };
            currentGlobalLevelIndex = progress.currentGlobalLevelIndex || 0;
            gameComplete = progress.gameComplete || false;

            if (scoreElement) scoreElement.textContent = score;
            // levelDisplayElement will be updated by startGlobalLevel
            initializeBadges();
            updateStreakDisplay(); // Streak is session-based

        } catch (e) {
            console.error("Error loading progress:", e);
            localStorage.removeItem('mathGameProgress');
            currentGlobalLevelIndex = 0; // Start fresh if error
        }
    }
}

// --- LEVEL SELECTOR ADAPTATION ---
if (levelGoBtn) {
    levelGoBtn.addEventListener('click', () => {
        const selectedCategory = categorySelect.value;
        const selectedDifficulty = difficultySelect.value;

        const foundLevelIndex = gameLevels.findIndex(level => level.category === selectedCategory && level.difficulty === selectedDifficulty);

        if (foundLevelIndex !== -1) {
            currentGlobalLevelIndex = foundLevelIndex;
            // Reset specific per-set counters, but overall score and badges persist
            consecutiveCorrect = 0; // Reset streak when jumping levels
            // gameComplete will be set by startGlobalLevel if needed
            // answered is global, don't reset fully

            // Reset UI elements for a fresh level start
            if (answerInput) { answerInput.style.display = ''; answerInput.disabled = false; }
            if (submitButton) { submitButton.style.display = ''; submitButton.disabled = false; }
            if (hintButton) hintButton.style.display = '';
            if (feedbackElement) feedbackElement.textContent = '';

            startGlobalLevel();
            saveProgress(); // Save new starting point
        } else {
            console.error("Selected level not found in gameLevels configuration.");
            if (feedbackElement) feedbackElement.textContent = "Sorry, that level isn't available.";
        }
    });
}

// Modify resetGameData to use new structure
function resetGameData() {
    score = 0;
    currentGlobalLevelIndex = 0;
    consecutiveCorrect = 0;
    gameComplete = false;
    badges = Object.fromEntries(Object.keys(badges).map(key => [key, false]));
    // Reset overall answered state
    answered = {
        fractions: { easy: [], medium: [], hard: [] },
        geometry: { easy: [], medium: [], hard: [] }
    };
    localStorage.removeItem('mathGameProgress');

    if (scoreElement) scoreElement.textContent = score;
    initializeBadges();
    updateStreakDisplay();
    resetHintsForNewQuestion();

    if (answerInput) { answerInput.style.display = ''; answerInput.disabled = false; }
    if (submitButton) { submitButton.style.display = ''; submitButton.disabled = false; }
    if (hintButton) hintButton.style.display = '';

    startGlobalLevel(); // Start from the very first global level
    if (feedbackElement) feedbackElement.textContent = "Game Reset!";
    setTimeout(() => { if (feedbackElement) feedbackElement.textContent = ""; }, 2000);
}

// --- INITIALIZATION (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    loadProgress(); // Load game state first (including currentGlobalLevelIndex)

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) applyTheme(savedTheme);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
    else applyTheme('light');
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => applyTheme(e.matches ? "dark" : "light"));

    initializeBadges();
    updateStreakDisplay();
    updateHintButton();

    if (gameComplete) { // If loaded game was already complete
        handleGameWon(); // Show the game won state
    } else {
        startGlobalLevel(); // Start at the loaded/default global level
    }
});
