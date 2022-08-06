import Game from "./game.js";

(() => {
  const cellsElem = document.querySelectorAll("[data-cell]");
  const boardElem = document.querySelector("[data-board]");
  const messageContainerElem = document.querySelector(
    "[data-messageContainer]"
  );
  const messageElem = document.querySelector("[data-message]");
  const restartButtonElem = document.querySelector("[data-restartButton]");

  const game = new Game();

  function setBoard(board) {
    cellsElem.forEach((cell, index) => {
      const boardCell = board[index];
      if (boardCell !== "") cell.classList.add(boardCell);
      else {
        cell.classList.remove("o");
        cell.classList.remove("x");
      }
    });
  }

  function setPlayer(player) {
    if (player === "x") {
      boardElem.classList.remove("o");
      boardElem.classList.add("x");
    } else {
      boardElem.classList.remove("x");
      boardElem.classList.add("o");
    }
  }

  function handleCellClick(position) {
    game.runRound(position);
  }

  function showMessage(winner) {
    if (!winner) {
      messageContainerElem.classList.add("show");
      messageElem.innerHTML = "Draw";

      return;
    }

    messageElem.innerHTML = `${winner} wins`;
    messageContainerElem.classList.add("show");
  }

  function hideMessage() {
    messageContainerElem.classList.remove("show");
    messageElem.innerHTML = "";
  }

  function handleRestartClick() {
    game.newGame();
  }

  function setupEventListeners() {
    restartButtonElem.addEventListener("click", handleRestartClick);

    cellsElem.forEach((cell, position) => {
      cell.addEventListener("click", () => handleCellClick(position));
    });
  }

  game.on("newGame", ({ board }) => {
    setBoard(board);
    hideMessage();
  });

  game.on("setBoard", ({ board }) => {
    setBoard(board);
  });

  game.on("setPlayer", ({ player }) => {
    setPlayer(player);
  });

  game.on("endGame", ({ status, player }) => {
    if (status === "win") return showMessage(player);

    showMessage();
  });

  setupEventListeners();

  game.newGame();
})();
