/*
 * main.js
 *
 * This script contains the core game logic for the Hacker Typing Game.
 * Words periodically fall from the top of the screen, and the player must
 * type them before they hit the bottom. Correctly typed words are removed
 * and increase the player's score, while missed words cost lives. When all
 * lives are lost, the game ends and offers a restart button.
 */

// List of potential words. These include a mix of short and
// longer terms to keep the game interesting. Feel free to add
// more words to this array to expand the vocabulary.
const WORDS = [
  'hack', 'code', 'data', 'login', 'virus', 'firewall',
  'trojan', 'malware', 'spyware', 'phishing', 'cyber',
  'network', 'password', 'encrypt', 'binary', 'matrix',
  'cipher', 'bug', 'router', 'security', 'server', 'system', 'computer', 'tracing'
];

// Game state variables
let fallingWords = [];
let typedString = '';
let score = 0;
let lives = 10;
let gameRunning = true;

// DOM references
const container = document.getElementById('gameContainer');
const scoreSpan = document.getElementById('score');
const livesSpan = document.getElementById('lives');
const typedDisplay = document.getElementById('typedDisplay');
const gameOverDiv = document.getElementById('gameOver');
const finalScoreP = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

/**
 * Spawns a new word at a random horizontal position. Each word is
 * represented by a DOM element and a corresponding JavaScript object
 * that tracks its position and speed.
 */
function spawnWord() {
  // Select a random word from the list
  const text = WORDS[Math.floor(Math.random() * WORDS.length)];
  const wordElem = document.createElement('div');
  wordElem.classList.add('word');
  wordElem.textContent = text;

  // Determine starting position and speed
  const x = Math.random() * (container.clientWidth - 80); // leave some margin
  const y = -30; // start just above the container
  const speed = 0.3 + Math.random() * 0.1; // speed between 0.5 and 1.5 pixels per frame

  // Apply initial positions to the DOM element
  wordElem.style.left = `${x}px`;
  wordElem.style.top = `${y}px`;

  // Append element to container
  container.appendChild(wordElem);

  // Add to the array of falling words
  fallingWords.push({ element: wordElem, text, x, y, speed });
}

/**
 * Removes a word from both the DOM and the tracking array. This helper
 * function keeps the removal logic consistent and avoids repetition.
 *
 * @param {number} index The index of the word in the fallingWords array
 */
function removeWordAt(index) {
  const w = fallingWords[index];
  if (w) {
    // Remove the DOM element
    container.removeChild(w.element);
    // Remove the object from the array
    fallingWords.splice(index, 1);
  }
}

/**
 * Handles the end-of-game sequence: show the overlay, display the final
 * score, and stop any further updates or spawns.
 */
function endGame() {
  gameRunning = false;
  // Show game over overlay
  gameOverDiv.classList.remove('hidden');
  finalScoreP.textContent = `You hacked ${score} word${score === 1 ? '' : 's'}!`;
}

/**
 * Main update loop. Uses requestAnimationFrame for smooth movement.
 */
function update() {
  if (!gameRunning) {
    return;
  }
  // Iterate backwards so removal doesn't affect iteration
  for (let i = fallingWords.length - 1; i >= 0; i--) {
    const w = fallingWords[i];
    // Update the vertical position
    w.y += w.speed;
    w.element.style.top = `${w.y}px`;
    // Check if the word has reached the bottom
    if (w.y + w.element.offsetHeight >= container.clientHeight) {
      // Word missed: remove and decrement lives
      removeWordAt(i);
      lives--;
      livesSpan.textContent = lives;
      // Clear current typed string since it doesn't correspond anymore
      typedString = '';
      typedDisplay.textContent = typedString;
      // End game if out of lives
      if (lives <= 0) {
        endGame();
        return;
      }
    }
  }
  // Schedule the next frame
  requestAnimationFrame(update);
}

// Kick off the update loop
requestAnimationFrame(update);

/**
 * Periodically spawn words while the game is running. We use setInterval
 * here because requestAnimationFrame runs as fast as possible, whereas
 * setInterval allows us to control the spawn rate in milliseconds.
 */
const SPAWN_INTERVAL = 7500; // spawn a new word every 2.5 seconds
const spawnTimer = setInterval(() => {
  if (gameRunning) {
    spawnWord();
  }
}, SPAWN_INTERVAL);

/**
 * Handle keyboard input. We capture all keystrokes at the document
 * level so that players don't need to focus a specific input field.
 */
document.addEventListener('keydown', (e) => {
  if (!gameRunning) {
    // Allow restart with Enter key when game is over
    if (e.key === 'Enter') {
      restartGame();
    }
    return;
  }
  // Use Backspace to delete the last character
  if (e.key === 'Backspace') {
    typedString = typedString.slice(0, -1);
  } else if (e.key.length === 1) {
    // Only consider single-character keys (letters, numbers, symbols)
    typedString += e.key.toLowerCase();
  } else {
    // Ignore other control keys
    return;
  }
  // Update the on-screen typed display
  typedDisplay.textContent = typedString;

  // Check if typed string matches any word exactly
  let matched = false;
  for (let i = 0; i < fallingWords.length; i++) {
    const w = fallingWords[i];
    if (typedString === w.text) {
      // Remove word and update score
      removeWordAt(i);
      score++;
      scoreSpan.textContent = score;
      // Clear typed string after successful match
      typedString = '';
      typedDisplay.textContent = '';
      matched = true;
      break;
    }
  }
  if (matched) {
    return;
  }
  // If not an exact match, check if typedString is a prefix of any word
  let hasPrefix = false;
  for (const w of fallingWords) {
    if (w.text.startsWith(typedString)) {
      hasPrefix = true;
      break;
    }
  }
  // If not a prefix, clear typed string (mistyped characters)
  if (!hasPrefix) {
    typedString = '';
    typedDisplay.textContent = '';
  }
});

/**
 * Restart the game by resetting all variables and clearing any
 * existing falling words. This function is called when the player
 * presses the Restart button or presses Enter after the game ends.
 */
function restartGame() {
  // Hide game-over overlay if visible
  gameOverDiv.classList.add('hidden');
  // Clear any falling words from the DOM
  for (const w of fallingWords) {
    container.removeChild(w.element);
  }
  fallingWords = [];
  // Reset game state
  score = 0;
  lives = 3;
  gameRunning = true;
  typedString = '';
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  typedDisplay.textContent = '';
}

// Hook up restart button click handler
restartButton.addEventListener('click', restartGame);

// Ensure the window has focus so keystrokes are captured. Without this,
// the browser might leave focus on the address bar or another element.
// Calling window.focus() here helps make sure the game responds to typing
// immediately after loading or restarting.
window.focus();