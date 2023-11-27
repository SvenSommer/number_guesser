// Constants
const MAX_NUMBER_DEFAULT = 100;

// Selectors
const rangeSlider = document.getElementById('rangeSlider');
const rangeValue = document.getElementById('rangeValue');
const buttonsContainer = document.getElementById('buttons');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');


// State
let maxNumber = MAX_NUMBER_DEFAULT;
let maxAttempts;
let attemptCount = 0;

// Initialize the game
window.onload = () => {
    initializeGame();
    rangeSlider.addEventListener('input', handleSliderChange);
};

function initializeGame() {
    fetch('/start')
        .then(response => response.json())
        .then(() => {
            setupGame();
        });
}

function setupGame() {
    maxNumber = parseInt(rangeSlider.value, 10);
    maxAttempts = calculateMaxAttempts(maxNumber);
    attemptCount = 0;
    updateProgressBar(); // Update progress bar on game setup
    createButtons(maxNumber);
    fetchGameStart();
}

function fetchGameStart() {
    fetch(`/start?maxNumber=${maxNumber}`)
        .then(response => response.json())
        .then(data => {
            createButtons(data.maxNumber);
        });
}

function handleSliderChange() {
    rangeValue.textContent = rangeSlider.value;
    setupGame();
}

function createButtons(number) {
    buttonsContainer.innerHTML = '';
    for (let i = 1; i <= number; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.id = `btn-${i}`;
        button.addEventListener('click', () => makeGuess(i));
        buttonsContainer.appendChild(button);
    }
}

function calculateMaxAttempts(number) {
    return Math.ceil(Math.log2(number));
}

function makeGuess(number) {
    console.log("Guessed Number:", number, "Max Number:", maxNumber);
    attemptCount++;
    updateProgressBar();

    if (attemptCount > maxAttempts) {
        alert("You've exceeded the maximum number of attempts. Game over!");
        window.location.reload();
        return;
    }

    fetch(`/guess/${number}`)
        .then(response => response.json())
        .then(data => handleGuessResponse(data, number))
        .catch(error => console.error('Error:', error));
}

function handleGuessResponse(data, guessedNumber) {
    console.log("Server Response:", data);
    if (data.result === "correct") {
        showWinningMessage();
    } else {
        updateButtonVisibility(data.result, guessedNumber);
    }
}

function showWinningMessage() {
    // Trigger confetti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        disableForReducedMotion: true
    });

    // Display winning message
    const winMessage = document.getElementById('winMessage');
    winMessage.classList.remove('hidden');
}

function updateButtonVisibility(result, guessedNumber) {
    const start = result === "higher" ? 1 : guessedNumber;
    const end = result === "higher" ? guessedNumber : maxNumber;

    for (let i = start; i <= end; i++) {
        const button = document.getElementById(`btn-${i}`);
        if (button) {
            button.style.visibility = 'hidden';
        }
    }
}

function updateProgressBar() {
    const attemptRatio = attemptCount / maxAttempts;
    progressBar.style.width = `${Math.min(attemptRatio * 100, 100)}%`;

    // Update progress text
    progressText.textContent = `Attempts: ${attemptCount} / ${maxAttempts}`;

    // Change color from green to red based on attempts
    const greenValue = 255 * (1 - attemptRatio);
    progressBar.style.backgroundColor = `rgb(255, ${greenValue}, 0)`;
}


document.getElementById('restartButton').addEventListener('click', restartGame);

function restartGame() {
    document.getElementById('winMessage').classList.add('hidden');
    attemptCount = 0;
    setupGame();
    // Reset other game elements as needed
}
