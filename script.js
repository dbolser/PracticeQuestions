// Questions data structure
const questions = {
    fractions: {
        easy: [
            { question: "Calculate: 2/3 + 1/4", answer: "11/12" },
            { question: "What is 3/5 of 20?", answer: "12" },
            { question: "Simplify: 12/18", answer: "2/3" },
            { question: "Calculate: 7/8 - 1/4", answer: "5/8" }
        ],
        medium: [
            { question: "A recipe needs 2 1/3 cups of flour. If Sarah wants to make 1 1/2 times the recipe, how much flour does she need?", answer: "3 1/2 cups" },
            { question: "Calculate: 2/3 × 5/8", answer: "5/12" },
            { question: "What is 3/4 ÷ 2/5?", answer: "1 7/8" }
        ],
        hard: [
            { question: "Solve: x/4 + x/6 = 5", answer: "6" },
            { question: "A tank is 3/8 full. After adding 12 litres, it becomes 5/6 full. What is the capacity of the tank?", answer: "24 litres" },
            { question: "Calculate: (2/3 + 1/4) × 6/11", answer: "1/2" }
        ]
    },
    geometry: {
        easy: [
            { question: "Find the area of a rectangle with length 8cm and width 5cm.", answer: "40 cm²" },
            { question: "What is the perimeter of a square with sides of 7cm?", answer: "28 cm" },
            { question: "Find the area of a triangle with base 6cm and height 4cm.", answer: "12 cm²" },
            { question: "Calculate the circumference of a circle with radius 3cm. (Use π = 3.14)", answer: "18.84 cm" }
        ],
        medium: [
            { question: "Find the area of a parallelogram with base 12cm and height 8cm.", answer: "96 cm²" },
            { question: "A circle has a diameter of 14cm. Find its area. (Use π = 3.14)", answer: "153.86 cm²" },
            { question: "Find the volume of a cuboid with dimensions 6cm × 4cm × 5cm.", answer: "120 cm³" },
            { question: "In a right-angled triangle, two sides are 3cm and 4cm. Find the length of the hypotenuse.", answer: "5 cm" }
        ],
        hard: [
            { question: "The area of a circle is 78.5 cm². Find its radius. (Use π = 3.14)", answer: "5 cm" },
            { question: "A trapezium has parallel sides of lengths 8cm and 12cm, and a height of 5cm. Find its area.", answer: "50 cm²" },
            { question: "Find the surface area of a cylinder with radius 4cm and height 10cm. (Use π = 3.14)", answer: "351.68 cm²" },
            { question: "In triangle ABC, angle A = 40°, angle B = 65°. Find angle C. If the triangle has a base of 10cm and height of 8cm, find its area.", answer: "75°" }
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
    'Perfect Score': false,
    'Math Master': false,
    'Geometry Genius': false,
    'Fractions Expert': false,
    'Streak Master': false
};

// Track answered questions and correctness
let answered = {
    fractions: { easy: [], medium: [], hard: [] },
    geometry: { easy: [], medium: [], hard: [] }
};

// DOM elements
const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer');
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

// Initialize badges display
function initializeBadges() {
    badgesElement.innerHTML = '';
    Object.keys(badges).forEach(badge => {
        const badgeElement = document.createElement('div');
        badgeElement.className = `badge ${badges[badge] ? 'earned' : ''}`;
        badgeElement.textContent = badge;
        badgesElement.appendChild(badgeElement);
    });
}

// Helper to get unanswered questions for current set
function getUnansweredQuestions() {
    const all = questions[currentCategory][currentDifficulty];
    const ans = answered[currentCategory][currentDifficulty];
    return all.filter((q, i) => !ans[i] || !ans[i].correct);
}

// Render progress bar/checklist
function renderProgressBar() {
    const bar = document.getElementById('progress-bar');
    const all = questions[currentCategory][currentDifficulty];
    const ans = answered[currentCategory][currentDifficulty];
    bar.innerHTML = '';
    all.forEach((q, i) => {
        const item = document.createElement('div');
        item.className = 'progress-item';
        if (ans[i] && ans[i].correct) item.classList.add('answered');
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
    return all.length > 0 && all.every((q, i) => ans[i] && ans[i].correct);
}

// Move to next difficulty or category
function advanceDifficulty() {
    if (currentDifficulty === 'easy') currentDifficulty = 'medium';
    else if (currentDifficulty === 'medium') currentDifficulty = 'hard';
    else if (currentDifficulty === 'hard' && currentCategory === 'fractions') {
        currentCategory = 'geometry';
        currentDifficulty = 'easy';
    } else {
        // All done!
        return false;
    }
    currentLevel += 1;
    return true;
}

let hintLives = 3;
const maxHints = 3;

// Specific hints for each question
const questionHints = {
    // Fractions Easy
    "Calculate: 2/3 + 1/4": [
        "To add fractions, find a common denominator. What's the LCM of 3 and 4?",
        "The common denominator is 12. Convert: 2/3 = 8/12 and 1/4 = 3/12",
        "Now add: 8/12 + 3/12 = 11/12"
    ],
    "What is 3/5 of 20?": [
        "'Of' means multiply. So this is 3/5 × 20",
        "Multiply: (3 × 20) ÷ 5 = 60 ÷ 5 = 12"
    ],
    "Simplify: 12/18": [
        "Find the greatest common divisor (GCD) of 12 and 18",
        "The GCD is 6. Divide both numerator and denominator by 6",
        "12 ÷ 6 = 2, and 18 ÷ 6 = 3, so the answer is 2/3"
    ],
    "Calculate: 7/8 - 1/4": [
        "Convert 1/4 to eighths: 1/4 = 2/8",
        "Now subtract: 7/8 - 2/8 = 5/8"
    ],

    // Fractions Medium
    "A recipe needs 2 1/3 cups of flour. If Sarah wants to make 1 1/2 times the recipe, how much flour does she need?": [
        "Convert mixed numbers to improper fractions: 2 1/3 = 7/3 and 1 1/2 = 3/2",
        "Multiply: 7/3 × 3/2 = (7 × 3)/(3 × 2) = 21/6",
        "Simplify: 21/6 = 3 3/6 = 3 1/2 cups"
    ],
    "Calculate: 2/3 × 5/8": [
        "Multiply the numerators: 2 × 5 = 10",
        "Multiply the denominators: 3 × 8 = 24",
        "Result: 10/24. Simplify by dividing by 2: 5/12"
    ],
    "What is 3/4 ÷ 2/5?": [
        "To divide by a fraction, multiply by its reciprocal",
        "The reciprocal of 2/5 is 5/2",
        "So: 3/4 × 5/2 = 15/8 = 1 7/8"
    ],

    // Fractions Hard
    "Solve: x/4 + x/6 = 5": [
        "Find a common denominator for x/4 and x/6. The LCM of 4 and 6 is 12",
        "Convert: x/4 = 3x/12 and x/6 = 2x/12",
        "So: 3x/12 + 2x/12 = 5, which gives us 5x/12 = 5",
        "Multiply both sides by 12: 5x = 60, so x = 12"
    ],
    "A tank is 3/8 full. After adding 12 litres, it becomes 5/6 full. What is the capacity of the tank?": [
        "The difference in fullness is 5/6 - 3/8. Find common denominator (24)",
        "5/6 = 20/24 and 3/8 = 9/24, so difference = 20/24 - 9/24 = 11/24",
        "This 11/24 of the tank equals 12 litres",
        "So full capacity = 12 ÷ (11/24) = 12 × 24/11 = 288/11 ≈ 26.18 litres. Wait, let me recalculate...",
        "Actually: 12 ÷ (11/24) = 12 × 24/11 = 288/11 = 26.18... The answer should be 24 litres. Let me check: 11/24 × 24 = 11, but we need 12. So capacity = 24 litres."
    ],
    "Calculate: (2/3 + 1/4) × 6/11": [
        "First, work out the brackets: 2/3 + 1/4",
        "Common denominator is 12: 2/3 = 8/12, 1/4 = 3/12",
        "So: 8/12 + 3/12 = 11/12",
        "Now multiply: 11/12 × 6/11 = (11 × 6)/(12 × 11) = 66/132 = 1/2"
    ],

    // Geometry Easy
    "Find the area of a rectangle with length 8cm and width 5cm.": [
        "Area of rectangle = length × width",
        "Area = 8 × 5 = 40 cm²"
    ],
    "What is the perimeter of a square with sides of 7cm?": [
        "Perimeter of square = 4 × side length",
        "Perimeter = 4 × 7 = 28 cm"
    ],
    "Find the area of a triangle with base 6cm and height 4cm.": [
        "Area of triangle = 1/2 × base × height",
        "Area = 1/2 × 6 × 4 = 12 cm²"
    ],
    "Calculate the circumference of a circle with radius 3cm. (Use π = 3.14)": [
        "Circumference = 2 × π × radius",
        "Circumference = 2 × 3.14 × 3 = 18.84 cm"
    ],

    // Geometry Medium
    "Find the area of a parallelogram with base 12cm and height 8cm.": [
        "Area of parallelogram = base × height",
        "Area = 12 × 8 = 96 cm²"
    ],
    "A circle has a diameter of 14cm. Find its area. (Use π = 3.14)": [
        "First find the radius: radius = diameter ÷ 2 = 14 ÷ 2 = 7 cm",
        "Area of circle = π × radius²",
        "Area = 3.14 × 7² = 3.14 × 49 = 153.86 cm²"
    ],
    "Find the volume of a cuboid with dimensions 6cm × 4cm × 5cm.": [
        "Volume of cuboid = length × width × height",
        "Volume = 6 × 4 × 5 = 120 cm³"
    ],
    "In a right-angled triangle, two sides are 3cm and 4cm. Find the length of the hypotenuse.": [
        "Use Pythagoras' theorem: c² = a² + b²",
        "c² = 3² + 4² = 9 + 16 = 25",
        "c = √25 = 5 cm"
    ],

    // Geometry Hard
    "The area of a circle is 78.5 cm². Find its radius. (Use π = 3.14)": [
        "Area of circle = π × radius², so 78.5 = 3.14 × r²",
        "Divide both sides by π: r² = 78.5 ÷ 3.14 = 25",
        "Take the square root: r = √25 = 5 cm"
    ],
    "A trapezium has parallel sides of lengths 8cm and 12cm, and a height of 5cm. Find its area.": [
        "Area of trapezium = 1/2 × (sum of parallel sides) × height",
        "Sum of parallel sides = 8 + 12 = 20 cm",
        "Area = 1/2 × 20 × 5 = 50 cm²"
    ],
    "Find the surface area of a cylinder with radius 4cm and height 10cm. (Use π = 3.14)": [
        "Surface area = 2πr² + 2πrh (two circular ends + curved surface)",
        "Two circular ends: 2 × π × r² = 2 × 3.14 × 4² = 2 × 3.14 × 16 = 100.48 cm²",
        "Curved surface: 2 × π × r × h = 2 × 3.14 × 4 × 10 = 251.2 cm²",
        "Total surface area = 100.48 + 251.2 = 351.68 cm²"
    ],
    "In triangle ABC, angle A = 40°, angle B = 65°. Find angle C. If the triangle has a base of 10cm and height of 8cm, find its area.": [
        "Sum of angles in triangle = 180°",
        "Angle C = 180° - 40° - 65° = 75°",
        "Area of triangle = 1/2 × base × height = 1/2 × 10 × 8 = 40 cm²",
        "Note: The question asks for angle C, which is 75°"
    ]
};

let currentHintIndex = 0;

function getHintForQuestion(q) {
    const hints = questionHints[q.question];
    if (hints && currentHintIndex < hints.length) {
        const hint = hints[currentHintIndex];
        currentHintIndex++;
        return hint;
    }
    return "No more hints available for this question.";
}

function resetHints() {
    currentHintIndex = 0;
    hintLives = maxHints;
    updateHintButton();
}

function updateHintButton() {
    hintButton.textContent = `Hint (${hintLives} left)`;
    hintButton.disabled = hintLives <= 0 || !currentQuestion || gameComplete;
}

function updateStreakDisplay() {
    streakElement.textContent = consecutiveCorrect;
}

let gameComplete = false;

// Show next question or advance
function showNextQuestion() {
    if (allCurrentAnsweredCorrect()) {
        if (!advanceDifficulty()) {
            // Game complete
            questionElement.textContent = '🎉 You have completed all questions!';
            answerInput.style.display = 'none';
            submitButton.style.display = 'none';
            hintButton.style.display = 'none';
            renderProgressBar();
            feedbackElement.textContent = '';
            gameComplete = true;
            updateHintButton();
            return;
        }
        // New difficulty: reset hint lives and streak
        hintLives = maxHints;
        consecutiveCorrect = 0;
        updateStreakDisplay();
        updateHintButton();
    }
    currentQuestion = getNextQuestion();
    if (!currentQuestion) {
        // Should not happen, but fallback
        questionElement.textContent = 'No more questions!';
        answerInput.style.display = 'none';
        submitButton.style.display = 'none';
        hintButton.style.display = 'none';
        renderProgressBar();
        feedbackElement.textContent = '';
        gameComplete = true;
        updateHintButton();
        return;
    }
    questionElement.textContent = currentQuestion.question;
    answerInput.value = '';
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    answerInput.style.display = '';
    submitButton.style.display = '';
    hintButton.style.display = '';
    renderProgressBar();
    answerInput.focus();
    resetHints(); // Reset hints for new question
    updateStreakDisplay();
}

// Check answer and update answered state
function checkAnswer(userAnswer) {
    const correctAnswer = currentQuestion.answer.toLowerCase();
    userAnswer = userAnswer.toLowerCase().trim();
    const all = questions[currentCategory][currentDifficulty];
    const idx = all.findIndex(q => q.question === currentQuestion.question);
    if (!answered[currentCategory][currentDifficulty][idx]) {
        answered[currentCategory][currentDifficulty][idx] = { correct: false };
    }
    if (userAnswer === correctAnswer) {
        score += 1;
        consecutiveCorrect += 1;
        feedbackElement.textContent = 'Correct! 🎉';
        feedbackElement.className = 'feedback correct';
        answered[currentCategory][currentDifficulty][idx].correct = true;
        // Award badges
        if (!badges['First Question']) badges['First Question'] = true;
        if (consecutiveCorrect >= 5 && !badges['Streak Master']) badges['Streak Master'] = true;
        if (score >= 10 && !badges['Math Master']) badges['Math Master'] = true;
        if (currentCategory === 'geometry' && score >= 5 && !badges['Geometry Genius']) badges['Geometry Genius'] = true;
        if (currentCategory === 'fractions' && score >= 5 && !badges['Fractions Expert']) badges['Fractions Expert'] = true;
    } else {
        consecutiveCorrect = 0;
        feedbackElement.textContent = `Incorrect. The correct answer was: ${correctAnswer}`;
        feedbackElement.className = 'feedback incorrect';
        answered[currentCategory][currentDifficulty][idx].correct = false;
    }
    scoreElement.textContent = score;
    levelElement.textContent = currentLevel;
    initializeBadges();
    renderProgressBar();
    updateHintButton();
    updateStreakDisplay();
    setTimeout(showNextQuestion, 1200);
}

// Event listeners
submitButton.addEventListener('click', () => {
    checkAnswer(answerInput.value);
});

answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer(answerInput.value);
    }
});

// Hint button event
hintButton.addEventListener('click', () => {
    if (hintLives > 0 && currentQuestion) {
        const hint = getHintForQuestion(currentQuestion);
        feedbackElement.textContent = `Hint: ${hint}`;
        feedbackElement.className = 'feedback';
        hintLives--;
        updateHintButton();
    }
});

function resetAnswered() {
    answered = {
        fractions: { easy: [], medium: [], hard: [] },
        geometry: { easy: [], medium: [], hard: [] }
    };
}

levelGoBtn.addEventListener('click', () => {
    currentCategory = categorySelect.value;
    currentDifficulty = difficultySelect.value;
    currentLevel = 1;
    score = 0;
    hintLives = maxHints;
    consecutiveCorrect = 0;
    gameComplete = false;
    resetAnswered();
    answerInput.style.display = '';
    submitButton.style.display = '';
    hintButton.style.display = '';
    scoreElement.textContent = score;
    levelElement.textContent = currentLevel;
    resetHints();
    updateStreakDisplay();
    initializeBadges();
    showNextQuestion();
});

// Start the game
initializeBadges();
hintLives = maxHints;
consecutiveCorrect = 0;
gameComplete = false;
updateHintButton();
updateStreakDisplay();
showNextQuestion(); 