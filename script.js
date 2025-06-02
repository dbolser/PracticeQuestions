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

// DOM elements
const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitButton = document.getElementById('submit');
const feedbackElement = document.getElementById('feedback');
const levelElement = document.getElementById('level');
const scoreElement = document.getElementById('score');
const badgesElement = document.getElementById('badges');

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

// Get random question
function getRandomQuestion() {
    const categoryQuestions = questions[currentCategory][currentDifficulty];
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
}

// Update level and difficulty
function updateLevel() {
    if (score >= 30) {
        currentDifficulty = 'hard';
    } else if (score >= 15) {
        currentDifficulty = 'medium';
    }

    if (score >= 20 && currentCategory === 'fractions') {
        currentCategory = 'geometry';
    }

    levelElement.textContent = currentLevel;
}

// Check answer
function checkAnswer(userAnswer) {
    const correctAnswer = currentQuestion.answer.toLowerCase();
    userAnswer = userAnswer.toLowerCase().trim();

    if (userAnswer === correctAnswer) {
        score += 1;
        consecutiveCorrect += 1;
        feedbackElement.textContent = 'Correct! 🎉';
        feedbackElement.className = 'feedback correct';

        // Award badges
        if (!badges['First Question']) {
            badges['First Question'] = true;
        }
        if (consecutiveCorrect >= 5 && !badges['Streak Master']) {
            badges['Streak Master'] = true;
        }
        if (score >= 10 && !badges['Math Master']) {
            badges['Math Master'] = true;
        }
        if (currentCategory === 'geometry' && score >= 5 && !badges['Geometry Genius']) {
            badges['Geometry Genius'] = true;
        }
        if (currentCategory === 'fractions' && score >= 5 && !badges['Fractions Expert']) {
            badges['Fractions Expert'] = true;
        }
    } else {
        consecutiveCorrect = 0;
        feedbackElement.textContent = `Incorrect. The correct answer was: ${correctAnswer}`;
        feedbackElement.className = 'feedback incorrect';
    }

    scoreElement.textContent = score;
    currentLevel += 1;
    updateLevel();
    initializeBadges();
    setTimeout(showNextQuestion, 1500);
}

// Show next question
function showNextQuestion() {
    currentQuestion = getRandomQuestion();
    questionElement.textContent = currentQuestion.question;
    answerInput.value = '';
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    answerInput.focus();
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

// Start the game
initializeBadges();
showNextQuestion(); 