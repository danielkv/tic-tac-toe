import EventEmitter from "../public/eventEmitter.js";

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

    gameId = null;
    state = "running";
    players = { o: null, x: null };
    currentPlayer = "o";
    currentBoard = Array.from({ length: 9 }).fill("");

    constructor(gameId, initialPlayer) {
        super();
        this.gameId = gameId;

        this.resetGame(initialPlayer);
    }

    getTurn() {
        if (this.isRunning()) return this.currentPlayer;

        return "paused";
    }

    getGameId() {
        return this.gameId;
    }

    getSymbolByPlayerId(playerId) {
        if (this.players.o === playerId) return "o";
        else if (this.players.x === playerId) return "x";

        throw new Error(`Player ${playerId} isn't in this game`);
    }

    isPlayerInGame(playerId) {
        try {
            const symbol = this.getSymbolByPlayerId(playerId);
            if (symbol) return true;
            return false;
        } catch (e) {
            return false;
        }
    }

    setState(newState) {
        this.state(newState);

        const payload = {
            board: this.currentBoard,
            player: this.currentPlayer,
            gameId: this.gameId,
        };

        this.emit("change_state", newState, payload);
    }

    getState() {
        const missing = this.getMissingPlayer();

        if (this.state === "paused") return "paused";

        switch (missing) {
            case false:
                return "running";
            case "o":
                return "waiting_player_o";
            case "x":
                return "waiting_player_x";
            case "both":
                return "no_player";
            default:
                return "paused";
        }
    }

    isRunning() {
        return this.getState() === "running";
    }

    removePlayerById(playerId) {
        const symbol = this.getSymbolByPlayerId(playerId);
        this.players[symbol] = null;
    }

    getMissingPlayer() {
        if (!this.players.o && !this.players.x) return "both";

        if (!this.players.o) return "o";

        if (!this.players.x) return "x";

        return false;
    }

    assignPlayer(symbol, playerId) {
        if (symbol !== "x" && symbol !== "o")
            throw new Error(`Cannot set symbol ${symbol}`);

        this.players[symbol] = playerId;
    }

    getPlayers() {
        return this.players;
    }

    setBoardPosition(position) {
        const currentPositionValue = this.currentBoard[position];

        console.log(currentPositionValue);

        if (currentPositionValue !== "")
            throw new Error("Position already taken");

        this.currentBoard[position] = this.currentPlayer;

        const payload = {
            board: this.currentBoard,
            player: this.currentPlayer,
            gameId: this.gameId,
        };

        this.emit("setBoard", payload);
    }

    runRound(position) {
        this.setBoardPosition(position);

        this.swapPlayer();

        const payload = {
            board: this.currentBoard,
            player: this.currentPlayer,
            gameId: this.gameId,
        };

        if (this.checkWin()) {
            return this.emit("endGame", { ...payload, status: "win" });
        }

        if (this.checkDraw()) {
            return this.emit("endGame", { ...payload, status: "draw" });
        }

        this.emit("runRound", payload);
    }

    checkWin() {
        return this.winningPositions.some((positions) => {
            const cellInPositions = positions.map(
                (pos) => this.currentBoard[pos]
            );

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
            gameId: this.gameId,
        };

        this.emit("resetBoard", payload);
    }

    setCurrentPlayer(player) {
        if (player !== "x" && player !== "o") return;

        this.currentPlayer = player;

        const payload = {
            board: this.currentBoard,
            player: this.currentPlayer,
            gameId: this.gameId,
        };

        this.emit("setPlayer", payload);
    }

    getCurrentPlayerId() {
        return this.players[this.currentPlayer];
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    swapPlayer() {
        if (this.currentPlayer === "x") this.setCurrentPlayer("o");
        else this.setCurrentPlayer("x");
    }

    resetGame(initialPlayer) {
        if (initialPlayer !== "x" && initialPlayer !== "o")
            throw new Error(
                `${initialPlayer} cannot be assigned as initial player`
            );

        this.setCurrentPlayer(initialPlayer);
        this.resetBoard();
    }

    startGame() {
        const payload = {
            board: this.currentBoard,
            player: this.currentPlayer,
            gameId: this.gameId,
        };

        this.emit("startGame", payload);
    }
}
