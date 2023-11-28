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

document.getElementById('preferencesIcon').addEventListener('click', function() {
    var panel = document.getElementById('preferencesPanel');
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
    } else {
        panel.classList.add('hidden');
    }
});


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
    const gridSize = Math.ceil(Math.sqrt(number));
    const buttonBasis = (100 / gridSize) - 2;
    const buttonFontSize = Math.max(16, 600 / gridSize); // Minimum font size of 16px

    for (let i = 1; i <= number; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.id = `btn-${i}`;
        button.style.flexBasis = `${buttonBasis}%`;
        button.style.height = `${buttonBasis}%`; // Adjust height as well
        button.style.fontSize = `${buttonFontSize}px`; // Dynamic font size
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
        gameOver()
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
function gameOver() {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'block';

    const closeButton = modal.querySelector('.close');
    closeButton.onclick = function() {
        modal.style.display = 'none';
    }

    const restartButton = document.getElementById('restartGame');
    restartButton.onclick = function() {
        modal.style.display = 'none';
        restartGame();
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

function applyRandomShakeEffect() {
    const buttons = Array.from(document.querySelectorAll('#buttons button')).filter(button => button.style.visibility !== 'hidden');
    
    if (buttons.length === 0) {
        return; 
    }

    const randomButtonIndex = Math.floor(Math.random() * buttons.length);
    const buttonToShake = buttons[randomButtonIndex];

    buttonToShake.classList.add('shake');

    // Remove the shake effect after some time
    setTimeout(() => {
        buttonToShake.classList.remove('shake');
    }, 500); // Match this duration with the CSS animation duration
}

// Apply the effect to a random button every second
setInterval(applyRandomShakeEffect, 2000);