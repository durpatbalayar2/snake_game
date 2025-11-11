const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");
const restartButton = document.querySelector(".btn-restart");

const highScoreElement = document.querySelector("#high-score");

const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const blockHeight = 50;
const blockWidth = 50;

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00-00`;

highScoreElement.innerText = highScore;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);

let intervalId = null;
let timerIntervalId = null;

let isPaused = false;

const eatSound = new Audio("./sounds/eat.mp3");
const gameOverSound = new Audio("./sounds/end.mp3");

let speed = 500; // speed logic

let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};

const blocks = [];

let snake = [
  {
    x: 1,
    y: 3,
  },
];

let direction = "down";

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");

    block.classList.add("block");
    board.appendChild(block);
    // block.innerText = `${row}-${col}`;
    blocks[`${row}-${col}`] = block;
  }
}

function render() {
  let head = null;

  // food

  blocks[`${food.x}-${food.y}`].classList.add("food");
  //direction logic
  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  }
  // wall collison logic

  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    gameOverSound.play();
    clearInterval(intervalId);
    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
    return;
  }

  // Self collision logic

  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOverSound.play();
      clearInterval(intervalId);
      clearInterval(timerIntervalId);
      modal.style.display = "flex";
      startGameModal.style.display = "none";
      gameOverModal.style.display = "flex";
      return;
    }
  }

  // food consume logic

  if (head.x == food.x && head.y == food.y) {
    eatSound.play();
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    blocks[`${food.x}-${food.y}`].classList.add("food");

    snake.unshift(head);

    score += 1;
    scoreElement.innerText = score;

    if (score > highScore) {
      highScore = score;

      localStorage.setItem("highScore", highScore.toString());
    }

    if (score % 5 === 0) {
      speed = Math.max(100, speed - 50);
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        render();
      }, speed);
    }
  }

  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill", "snake-head");
  });

  snake.unshift(head);
  snake.pop();

  snake.forEach((segment, index) => {
    const block = blocks[`${segment.x}-${segment.y}`];
    if (index === 0) {
      block.classList.add("snake-head");
    } else {
      block.classList.add("fill");
    }
  });
}

startButton.addEventListener("click", () => {
  modal.style.display = "none";
  intervalId = setInterval(() => {
    render();
  }, speed);
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);
    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }
    time = `${min}-${sec}`;
    timeElement.innerText = time;
  }, 1000);
});

restartButton.addEventListener("click", restartGame);

function restartGame() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill", "snake-head");
  });

  score = 0;
  time = `00-00`;
  speed = 500;
  scoreElement.innerText = score;
  timeElement.innerText = time;
  highScoreElement.innerText = highScore;

  modal.style.display = "none";
  direction = "down";
  snake = [{ x: 1, y: 3 }];
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
  intervalId = setInterval(() => {
    render();
  }, speed);

  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);
    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }
    time = `${min}-${sec}`;
    timeElement.innerText = time;
  }, 1000);
}

// Pause & Resume Game logic

function pauseGame() {
  clearInterval(intervalId);
  clearInterval(timerIntervalId);
  document.body.classList.add("paused");
  isPaused = true;
}

function resumeGame() {
  intervalId = setInterval(() => {
    render();
  }, speed);
  timerIntervalId = setInterval(() => {
    let [min, sec] = time.split("-").map(Number);
    if (sec == 59) {
      min += 1;
      sec = 0;
    } else {
      sec += 1;
    }
    time = `${min}-${sec}`;
    timeElement.innerText = time;
  }, 1000);
  document.body.classList.remove("paused");

  isPaused = false;
}

addEventListener("keydown", (event) => {
  if (event.key == "ArrowUp") {
    direction = "up";
  } else if (event.key == "ArrowRight") {
    direction = "right";
  } else if (event.key == "ArrowLeft") {
    direction = "left";
  } else if (event.key == "ArrowDown") {
    direction = "down";
  } else if (event.key === " ") {
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  }
});
