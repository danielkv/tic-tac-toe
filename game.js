const cells = document.querySelectorAll("[data-cell]");
const board = document.querySelector("[data-board]");
const messageContainer = document.querySelector("[data-messageContainer]");
const message = document.querySelector("[data-message]");
const restartButton = document.querySelector("[data-restartButton]");
let currentPlayer = "o"; // x \ o

const winnerPositions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function newGame() {
  clearCells();
  setPlayer("o");
  hideMessage();
  setupEventListeners();
}

function handleCellClick(e) {
  e.target.classList.add(currentPlayer);

  if (checkWin()) {
    return showMessage(currentPlayer);
  }

  if (checkDraw()) {
    return showMessage();
  }

  swapPlayer();
}

function checkWin() {
  return winnerPositions.some((positions) => {
    const cellInPositions = positions.map((pos) => cells.item(pos));

    return cellInPositions.every((cell) =>
      cell.classList.contains(currentPlayer)
    );
  });
}
function checkDraw() {
  return [...cells].every(
    (cell) => cell.classList.contains("o") || cell.classList.contains("x")
  );
}

function showMessage(winner) {
  if (!winner) {
    messageContainer.classList.add("show");
    message.innerHTML = "Draw";

    return;
  }

  message.innerHTML = `${winner} wins`;
  messageContainer.classList.add("show");
}

function swapPlayer() {
  if (currentPlayer === "x") setPlayer("o");
  else setPlayer("x");
}

function setupEventListeners() {
  restartButton.addEventListener("click", newGame);

  cells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick, { once: true });
  });
}

function hideMessage() {
  messageContainer.classList.remove("show");
  message.innerHTML = "";
}

function clearCells() {
  cells.forEach((cell) => {
    cell.classList.remove("x");
    cell.classList.remove("o");
  });
}

function setPlayer(player) {
  if (player !== "x" && player !== "o") return;

  currentPlayer = player;

  if (player === "x") {
    board.classList.remove("o");
    board.classList.add("x");
  } else {
    board.classList.remove("x");
    board.classList.add("o");
  }
}

newGame();
