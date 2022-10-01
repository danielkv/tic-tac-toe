import Game from "./game.js";

class Games {
    games = {};
    initialPlayer = "o";

    addGame(game) {
        if (!game?.getGameId) throw new Error(`${game} It's not a game`);

        const gameId = game.getGameId();
        if (this.games[gameId]) throw new Error(`${gameId} already exists`);

        this.games[gameId] = game;
    }

    createNewGame() {
        const newGameId = this.generateGameId();
        const newGame = new Game(newGameId, this.initialPlayer);

        this.addGame(newGame);

        return newGame;
    }

    findGamesByPlayerId(playerId) {
        const foundGames = Object.values(this.games).filter((game) =>
            game.isPlayerInGame(playerId)
        );

        return foundGames;
    }

    removeGame(gameId) {
        if (!this.games[gameId])
            throw new Error(`Game ${gameId} doesn't exist`);

        delete this.games[gameId];
    }

    getGameById(gameId) {
        if (!this.games[gameId])
            throw new Error(`Game ${gameId} doesn't exist`);

        return this.games[gameId];
    }

    generateGameId() {
        const gameId = Math.round(Math.random() * Math.pow(10, 12));

        return String(gameId);
    }

    // deprecated
    generatePlayerId() {
        const userId = Math.round(Math.random() * Math.pow(10, 12));

        return userId;
    }
}

export default new Games();
