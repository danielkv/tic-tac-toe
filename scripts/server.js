import express from "express";
import games from "./games.js";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import events from "events";

events.captureRejections = true;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("public"));

app.use((err, req, res, next) => {
    console.error(err.message);
});

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "views", "create-room.html"));
});

app.get("/games", (req, res) => {
    res.json(games.games);
});

app.get("/create-game", (req, res) => {
    const newGame = games.createNewGame();
    const gameId = newGame.getGameId();

    setupGameListeners(newGame);

    res.json({ gameId });
});

app.get("/:token", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "views", "game.html"));
});

server.listen(3000, () => {
    console.log("listening on *:3000");
});

// ###########################

io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        const playerId = socket.id;
        const foundGames = games.findGamesByPlayerId(playerId);

        foundGames.forEach((game) => {
            const gameId = game.getGameId();
            game.removePlayerById(playerId);

            io.to(gameId).emit("change_status", game.getState());
        });

        console.log(`Player ${playerId} disconnected`);
    });

    socket.on("join_game", (gameId, loggedUserId) => {
        try {
            const game = games.getGameById(gameId);
            let payload = { userId: null, player: null };

            if (game.isPlayerInGame(loggedUserId)) {
                payload = joinReturningPlayer(game, loggedUserId, socket.id);
            } else {
                payload = joinNewPlayer(game, socket.id);
            }

            socket.join(gameId);
            socket.emit("joined_game", payload);

            io.to(gameId).emit("change_status", game.getState());

            if (game.isRunning()) game.startGame();
        } catch (err) {
            console.log(err);
        }
    });

    socket.on("run_round", (gameId, position) => {
        try {
            const game = games.getGameById(gameId);

            game.runRound(position);
        } catch (err) {
            console.log(err);
        }
    });
});

function setTurn(game, currentPlayer) {
    io.to(game.getGameId()).emit("change_turn", currentPlayer);
}
function updateBoard(game, board) {
    io.to(game.getGameId()).emit("update_board", board);
}

function setupGameListeners(game) {
    game.on("startGame", ({ player, board }) => {
        try {
            setTurn(game, player);
            updateBoard(game, board);
        } catch (err) {
            console.log(err);
        }
    });

    game.on("runRound", ({ board, player }) => {
        try {
            updateBoard(game, board);
            setTurn(game, player);
        } catch (err) {
            console.log(err);
        }
    });
}

function joinReturningPlayer(game, returningPlayerId, socketId) {
    const symbol = game.getSymbolByPlayerId(returningPlayerId);
    const newUserId = socketId;
    game.assignPlayer(symbol, newUserId);

    return { userId: newUserId, player: symbol };
}

function joinNewPlayer(game, socketId) {
    const missing = game.getMissingPlayer();
    if (!missing) throw new Error(`Game ${game.getGameId()} is full`);

    const newUserId = socketId;
    const symbol = missing === "both" ? games.initialPlayer : missing;
    game.assignPlayer(symbol, newUserId);

    return { userId: newUserId, player: symbol };
}
