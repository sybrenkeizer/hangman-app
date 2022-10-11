const languageInp = document.getElementById("fc__language");
const wordLengthInp = document.getElementById("fc__word-length");
const timeInp = document.getElementById("fc__timer");
const submitBtn = document.getElementById("setup-submit-btn");
const setupModalContainer = document.querySelector(".setup-menu__modal-container");
const endGameModalContainer = document.querySelector(".end-game__modal-container");
const endGameBtn = document.getElementById('end-game-btn');
const notification = document.getElementById('notification-container');
const wrapper = document.getElementById('wrapper');
const hiddenWordEl = document.getElementById("hidden-word");
const wrongLettersEl = document.getElementById('wrong-letters');
const figureParts = document.querySelectorAll('.figure-part');
const endGameStatus = document.getElementById('end-game-status');
const endGameWord = document.getElementById('end-game-word');
const timerEl = document.getElementById('timer');
const stopGameBtn = document.getElementById('stop-game-btn');

let gameIsActive = false;
let choiceLanguage;
let choiceWordLength;
let choiceTimer;
let selectedWord = '';

const correctLetters = [];
const incorrectLetters = [];
const words = ["programming", "javascript", "library"];


// ====
// API
// ====

const getAPIData = (e) => {
  fetch(`https://random-word-api.herokuapp.com/word?length=${choiceWordLength}&lang=${choiceLanguage}`)
    .then(response => response.json())
    .then(data => {
      selectedWord = data[0];
      startGame(e);
    })
    .catch(error => console.log(error));
}



// ==========
// Functions
// ==========

const storeSetupOptions = (e) => {
	e.preventDefault();
	choiceLanguage = languageInp.value.slice(0, 2).toLowerCase();
	choiceWordLength = wordLengthInp.value;
	choiceTimer = timeInp.value;
};

const startGame = (e) => {
	if (!choiceLanguage && !choiceWordLength && !choiceTimer) return;
	hideModal(setupModalContainer);
	showHiddenLetters();
  hideBlur()
  gameIsActive = true;
  calcTime();
};

const showHiddenLetters = () => {
	hiddenWordEl.innerHTML = `
    ${selectedWord.split("").map((letter) =>
			`<span class="letter">${correctLetters.includes(letter)?letter:""}</span>`
			)
			.join("")}
  `;
};

const showWrongLetters = () => {
  const span = document.createElement('span');
  span.textContent = incorrectLetters[incorrectLetters.length - 1];
  wrongLettersEl.appendChild(span);
}

const showModal = (modal) => modal.style.display = 'block';
const hideModal = (modal) => modal.style.display = 'none';
const showBlur = () => wrapper.className = 'wrapper show-blur';
const hideBlur = () => wrapper.className = 'wrapper hide-blur';
const showWrongLetterContainer = () => wrongLettersEl.parentElement.classList.add('show');
const hideWrongLetterContainer = () => wrongLettersEl.parentElement.classList.remove('show');
const addToCorrectLetters = (letter) => {
  if (!correctLetters.includes(letter)) {
    correctLetters.push(letter);
    showHiddenLetters();
  }
}
const addToIncorrectLetters = (letter) => {
  if (!incorrectLetters.includes(letter)) {
    incorrectLetters.push(letter);
    showWrongLetters();
    displayFigureParts();
  } 
  incorrectLetters.length > 0 && showWrongLetterContainer();
}
const displayFigureParts = () => {
  figureParts.forEach((part, index) => {
    incorrectLetters.length > index 
      ? part.style.display = 'block' 
      : part.style.display = 'none';
  })
}

const addLetter = (e) => {
  const letter = e.code.match(/[A-Z]$/)[0].toLowerCase();
  notifyDuplicate(letter);
  selectedWord.includes(letter) 
    ? addToCorrectLetters(letter) 
    : addToIncorrectLetters(letter);
  checkProgressGame();
}

const notifyDuplicate = (letter) => {
  if (correctLetters.includes(letter) || incorrectLetters.includes(letter)) {
    const notificationMessage = document.getElementById('notification-message');
    notificationMessage.textContent = `You already used the letter ${letter}`
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
}

const checkProgressGame = () => {
  const guessedLetters = hiddenWordEl.innerText.replace(/\n/g, '');
  const gameIsLost = incorrectLetters.length === 6;
  const gameIsWon = guessedLetters.length === selectedWord.length;
  if (gameIsLost) {
    endGame('lose');
  } else if (gameIsWon) {
    endGame('win');
  }
}

const endGame = (status) => {
  showModal(endGameModalContainer);
  showBlur();
  endGameStatus.textContent = `You have ${status === 'lose' ? 'Lost' : 'Won'}`;
  endGameWord.textContent = `The hidden word was: ${selectedWord}`;
}

const showSetupMenu = () => {
  hideModal(endGameModalContainer);
  showModal(setupModalContainer)
  emptySetupMenuInput();
  gameIsActive = false;
}

const emptySetupMenuInput = () => {
  languageInp.value = '';
  wordLengthInp.value = '';
  timeInp.value = '';
}

const calcTime = () => {
  let minutes;
  let seconds;
  let time = Number(choiceTimer)
  const interval = setInterval(() => {
    minutes = Math.floor(time / 60);
    seconds = Math.floor(time % 60);
    setTimer(seconds, minutes);
    time--;
    if (time < 0 || !gameIsActive ) {
      clearInterval(interval);
      setTimeout(() => endGame('lose'), 2000);
    } 
  }, 1000);
}

const setTimer = (sec, min) => {
  let minutes = min < 10 ? '0' + min : min;
  let seconds = sec < 10 ? '0' + sec : sec;
  timerEl.textContent = `${minutes} : ${seconds}`;
}

const stopGame = () => {
  gameIsActive = false;
}

// ================
// Event Listeners
// ================
submitBtn.addEventListener("click", (e) => {
	storeSetupOptions(e);
  getAPIData()
});
window.addEventListener('keydown', (e) => {
  if (gameIsActive) addLetter(e);
});
endGameBtn.addEventListener('click', showSetupMenu);
stopGameBtn.addEventListener('click', stopGame);
