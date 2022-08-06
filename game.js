import EventEmitter from "./eventEmitter.js";

export default class Game extends EventEmitter {
  winningPositions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  currentPlayer = "o";
  currentBoard = Array.from({ length: 9 }).fill("");

  setBoardPosition(position) {
    const currentPositionValue = this.currentBoard[position];
    console.log(this.currentBoard, position, currentPositionValue);

    if (currentPositionValue !== "") throw new Error("Position already taken");

    this.currentBoard[position] = this.currentPlayer;

    const payload = {
      board: this.currentBoard,
      player: this.currentPlayer,
    };

    this.emit("setBoard", payload);
  }

  runRound(position) {
    this.setBoardPosition(position);

    const payload = {
      board: this.currentBoard,
      player: this.currentPlayer,
    };

    if (this.checkWin()) {
      return this.emit("endGame", { ...payload, status: "win" });
    }

    if (this.checkDraw()) {
      return this.emit("endGame", { ...payload, status: "draw" });
    }

    this.swapPlayer();

    this.emit("runRound", payload);
  }

  checkWin() {
    return this.winningPositions.some((positions) => {
      const cellInPositions = positions.map((pos) => this.currentBoard[pos]);

      return cellInPositions.every((cell) => cell === this.currentPlayer);
    });
  }

  checkDraw() {
    return this.currentBoard.every((cell) => !!cell);
  }

  resetBoard() {
    this.currentBoard = Array.from({ length: 9 }).fill("");

    const payload = {
      board: this.currentBoard,
      player: this.currentPlayer,
    };

    this.emit("resetBoard", payload);
  }

  setPlayer(player) {
    if (player !== "x" && player !== "o") return;

    this.currentPlayer = player;

    const payload = {
      board: this.currentBoard,
      player: this.currentPlayer,
    };

    this.emit("setPlayer", payload);
  }

  swapPlayer() {
    if (this.currentPlayer === "x") this.setPlayer("o");
    else this.setPlayer("x");
  }

  newGame() {
    this.setPlayer("o");
    this.resetBoard();

    const payload = {
      board: this.currentBoard,
      player: this.currentPlayer,
    };

    this.emit("newGame", payload);
  }
}
