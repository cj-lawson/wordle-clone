const ROW_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const letters = document.querySelectorAll(".tile");

async function init() {
  // App state
  let currentRow = 0;
  let currentGuess = "";
  let gameOver = false;

  //   Fetch word of the day
  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const { word: wordRes } = await res.json();
  const word = wordRes.toUpperCase();
  const wordParts = word.split("");

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
    console.log(wordParts);

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
      // win
      alert("you win!");
      done = true;
    } else if (currentRow === MAX_ATTEMPTS) {
      // lose
      alert(`you lose, the word was ${word}`);
      done = true;
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

init();
