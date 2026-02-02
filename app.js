const questions = [
  {
    question: "Quelle planète est surnommée la planète rouge ?",
    answer: "mars",
  },
  {
    question: "Quel pays a pour capitale Lisbonne ?",
    answer: "portugal",
  },
  {
    question: "Combien de continents existe-t-il sur Terre ?",
    answer: "7",
  },
  {
    question: "Quel est l'auteur des Misérables ?",
    answer: "victor hugo",
  },
  {
    question: "Quel animal est le plus grand mammifère du monde ?",
    answer: "baleine bleue",
  },
  {
    question: "Dans quel sport utilise-t-on un ballon ovale ?",
    answer: "rugby",
  },
  {
    question: "Quel océan borde la côte ouest de la France ?",
    answer: "atlantique",
  },
  {
    question: "Quelle est la devise de l'Union européenne ?",
    answer: "unie dans la diversité",
  },
  {
    question: "Combien de jours compte une année bissextile ?",
    answer: "366",
  },
  {
    question: "Quel est l'élément chimique dont le symbole est O ?",
    answer: "oxygene",
  },
];

const playerCountInput = document.getElementById("player-count");
const timerSecondsInput = document.getElementById("timer-seconds");
const playerNamesContainer = document.getElementById("player-names");
const startGameButton = document.getElementById("start-game");
const gameSection = document.getElementById("game");
const setupSection = document.getElementById("setup");
const resultsSection = document.getElementById("results");
const currentPlayerLabel = document.getElementById("current-player");
const questionCountLabel = document.getElementById("question-count");
const timerLabel = document.getElementById("timer");
const questionText = document.getElementById("question-text");
const answerInput = document.getElementById("answer");
const submitAnswerButton = document.getElementById("submit-answer");
const skipQuestionButton = document.getElementById("skip-question");
const feedback = document.getElementById("feedback");
const scoreboard = document.getElementById("scoreboard");
const restartButton = document.getElementById("restart");

let players = [];
let currentPlayerIndex = 0;
let currentQuestionIndex = 0;
let timer = null;
let timeRemaining = 0;
let timePerPlayer = 20;

function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function buildPlayerInputs() {
  const count = Number(playerCountInput.value);
  playerNamesContainer.innerHTML = "";

  for (let i = 0; i < count; i += 1) {
    const field = document.createElement("div");
    field.className = "field";

    const label = document.createElement("label");
    label.textContent = `Nom du joueur ${i + 1}`;
    label.setAttribute("for", `player-${i}`);

    const input = document.createElement("input");
    input.type = "text";
    input.id = `player-${i}`;
    input.placeholder = `Joueur ${i + 1}`;
    input.required = true;

    field.append(label, input);
    playerNamesContainer.appendChild(field);
  }
}

function resetGameState() {
  players = [];
  currentPlayerIndex = 0;
  currentQuestionIndex = 0;
  feedback.textContent = "";
  feedback.className = "feedback";
  answerInput.value = "";
  clearInterval(timer);
  timer = null;
}

function startTimer() {
  timeRemaining = timePerPlayer;
  timerLabel.textContent = timeRemaining;
  clearInterval(timer);

  timer = setInterval(() => {
    timeRemaining -= 1;
    timerLabel.textContent = timeRemaining;

    if (timeRemaining <= 0) {
      handleTimeOut();
    }
  }, 1000);
}

function renderQuestion() {
  const question = questions[currentQuestionIndex];
  questionText.textContent = question.question;
  questionCountLabel.textContent = `Question ${currentQuestionIndex + 1} / ${questions.length}`;
  answerInput.value = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  answerInput.focus();
  startTimer();
}

function moveToNextPlayer() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  currentPlayerLabel.textContent = players[currentPlayerIndex].name;
}

function moveToNextQuestion() {
  currentQuestionIndex += 1;
  if (currentQuestionIndex >= questions.length) {
    endGame();
    return;
  }
  moveToNextPlayer();
  renderQuestion();
}

function handleCorrectAnswer() {
  players[currentPlayerIndex].score += 1;
  feedback.textContent = "Bonne réponse ! On passe au joueur suivant.";
  feedback.classList.add("success");
  clearInterval(timer);
  setTimeout(() => {
    moveToNextQuestion();
  }, 700);
}

function handleWrongAnswer() {
  feedback.textContent = "Mauvaise réponse, le chrono continue !";
  feedback.classList.add("error");
}

function handleTimeOut() {
  clearInterval(timer);
  feedback.textContent = "Temps écoulé ! On passe au joueur suivant.";
  feedback.classList.add("error");
  setTimeout(() => {
    moveToNextQuestion();
  }, 700);
}

function submitAnswer() {
  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = normalizeAnswer(answerInput.value);
  const correctAnswer = normalizeAnswer(currentQuestion.answer);

  if (!userAnswer) {
    feedback.textContent = "Entrez une réponse avant de valider.";
    feedback.classList.add("error");
    return;
  }

  if (userAnswer === correctAnswer) {
    handleCorrectAnswer();
  } else {
    handleWrongAnswer();
  }
}

function skipQuestion() {
  feedback.textContent = "Question passée. Le chrono continue !";
  feedback.classList.add("error");
  answerInput.value = "";
  answerInput.focus();
}

function endGame() {
  clearInterval(timer);
  gameSection.classList.add("hidden");
  resultsSection.classList.remove("hidden");

  scoreboard.innerHTML = "";
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  sortedPlayers.forEach((player, index) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = `${index + 1}. ${player.name}`;
    const value = document.createElement("strong");
    value.textContent = `${player.score} point${player.score > 1 ? "s" : ""}`;
    item.append(label, value);
    scoreboard.appendChild(item);
  });
}

function startGame() {
  resetGameState();

  const count = Number(playerCountInput.value);
  timePerPlayer = Number(timerSecondsInput.value);

  const nameInputs = playerNamesContainer.querySelectorAll("input");
  players = Array.from(nameInputs).map((input, index) => ({
    name: input.value.trim() || `Joueur ${index + 1}`,
    score: 0,
  }));

  if (players.length === 0) {
    return;
  }

  setupSection.classList.add("hidden");
  resultsSection.classList.add("hidden");
  gameSection.classList.remove("hidden");

  currentPlayerIndex = 0;
  currentQuestionIndex = 0;
  currentPlayerLabel.textContent = players[currentPlayerIndex].name;

  if (count !== players.length) {
    buildPlayerInputs();
  }

  renderQuestion();
}

function restartGame() {
  setupSection.classList.remove("hidden");
  resultsSection.classList.add("hidden");
  gameSection.classList.add("hidden");
}

playerCountInput.addEventListener("change", buildPlayerInputs);
startGameButton.addEventListener("click", startGame);
submitAnswerButton.addEventListener("click", submitAnswer);
skipQuestionButton.addEventListener("click", skipQuestion);
restartButton.addEventListener("click", restartGame);
answerInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    submitAnswer();
  }
});

buildPlayerInputs();
