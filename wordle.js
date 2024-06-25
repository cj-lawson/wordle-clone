const ROW_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const letters = document.querySelectorAll(".tile");

// App state
let currentRow = 0;
let currentGuess = "";
let gameOver = false;
let wordParts = [];

// Fetch a random word and update wordParts
async function fetchAndSetWord() {
  wordParts = await fetchRandomWord();
}

async function fetchRandomWord() {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/cj-lawson/word-api/main/words.json"
    );
    if (!res.ok) {
      throw new Error("Failed to fetch words");
    }
    const data = await res.json();
    const words = data.words;
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex].toUpperCase();
    const wordParts = word.split("");
    return wordParts;
  } catch (error) {
    console.error("Error fetching random word:", error);
    return [];
  }
}

async function init() {
  await fetchAndSetWord();

  //   Parse & Route keystrokes
  document.addEventListener("keydown", function handleKeyPress(event) {
    if (gameOver) {
      return;
    }

    const char = event.key;

    if (char === "Enter") {
      submitGuess();
    } else if (char === "Backspace") {
      removeLetter();
    } else if (isLetter(char)) {
      addLetter(char.toUpperCase());
    } else {
    }
  });

  //  Add letter to tile
  function addLetter(letter) {
    if (currentGuess.length < ROW_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    letters[currentRow * ROW_LENGTH + currentGuess.length - 1].innerText =
      letter;
    letters[currentRow * ROW_LENGTH + currentGuess.length - 1].classList.add(
      "shaded-tile"
    );
  }

  //   Remove letter from tile "backspace"
  function removeLetter() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * ROW_LENGTH + currentGuess.length].innerText = "";
    letters[currentRow * ROW_LENGTH + currentGuess.length].classList.remove(
      "shaded-tile"
    );
  }

  //   User presses "Enter" and submits a guess
  async function submitGuess() {
    if (currentGuess.length !== ROW_LENGTH) {
      return;
    }

    const guessLetters = currentGuess.split("");
    const map = makeMap(wordParts);
    let allRight = true;

    // Finds correct letters
    for (let i = 0; i < ROW_LENGTH; i++) {
      if (guessLetters[i] === wordParts[i]) {
        // mark as correct
        letters[currentRow * ROW_LENGTH + i].classList.add("correct");
        map[guessLetters[i]]--;
      }
    }

    // Finds close and wrong letters
    for (let i = 0; i < ROW_LENGTH; i++) {
      if (guessLetters[i] === wordParts[i]) {
        // do nothing
      } else if (map[guessLetters[i]] && map[guessLetters[i]] > 0) {
        // mark as close
        allRight = false;
        letters[currentRow * ROW_LENGTH + i].classList.add("close");
        map[guessLetters[i]]--;
      } else {
        // wrong
        allRight = false;
        letters[currentRow * ROW_LENGTH + i].classList.add("wrong");
      }
    }

    currentRow++;
    currentGuess = "";

    if (allRight) {
      // Win
      fireConfetti();
      modalText.innerText = "Congrats! You guessed the word correctly";
      showModal();
      done = true;
    } else if (currentRow === MAX_ATTEMPTS) {
      // lose
      modalText.innerText = "Dang, you didn't get it this time";
      showModal();
      gameOver = true;
    }
  }
}

// Determine if valid letter
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

// Makes map out of array of letters
function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    if (obj[array[i]]) {
      obj[array[i]]++;
    } else {
      obj[array[i]] = 1;
    }
  }

  return obj;
}

// confetti animation
function fireConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

// Modal
const modal = document.getElementById("winModal");
const closeButton = document.querySelector(".close-button");
const modalText = document.getElementById("modal-text");
const replayButton = document.getElementById("replayButton");
const newGameButton = document.getElementById("newGameButton");

function showModal() {
  modal.style.display = "flex";
}

closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Replay current game
replayButton.addEventListener("click", () => {
  modal.style.display = "none";
  currentRow = 0;
  currentGuess = "";
  gameOver = false;
  resetGame();
});

// new game
newGameButton.addEventListener("click", async () => {
  modal.style.display = "none";
  currentRow = 0;
  currentGuess = "";
  gameOver = false;
  resetGame();
  await fetchAndSetWord();
});

// Reset Game
function resetGame() {
  letters.forEach((letter) => {
    letter.innerText = "";
    letter.classList.remove("correct", "close", "wrong", "shaded-tile");
  });
}

init();
