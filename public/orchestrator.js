(() => {
    const cellsElem = document.querySelectorAll("[data-cell]");
    const boardElem = document.querySelector("[data-board]");
    const messageContainerElem = document.querySelector(
        "[data-messageContainer]"
    );
    const messageElem = document.querySelector("[data-message]");
    const restartButtonElem = document.querySelector("[data-restartButton]");
    const statusElem = document.querySelector("[data-status]");
    const playerElem = document.querySelector("[data-player]");
    const turnElem = document.querySelector("[data-turn]");

    const USER_ID_STORAGE = "user_id_game";

    let gameId;
    let player;
    let socket;
    let status = "waiting_player";
    let turn;

    document.querySelector("[data-debug]").addEventListener("click", () => {
        console.log("gameId", gameId);
        console.log("player", player);
        console.log("status", status);
        console.log("turn", turn);
    });

    /* 

    

    

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

   



    function startUpGame() {
        game = new Game();

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

        game.newGame();
    } */

    function handleCellClick(position, _socket) {
        console.log(turn, player, position);
        if (turn !== player) return;

        _socket.emit("run_round", gameId, position);
    }
    function handleRestartClick() {
        //game.newGame();
    }

    function setupEventListeners(_socket) {
        restartButtonElem.addEventListener("click", handleRestartClick);

        cellsElem.forEach((cell, position) => {
            cell.addEventListener("click", () =>
                handleCellClick(position, _socket)
            );
        });
    }

    function updateBoard(board) {
        cellsElem.forEach((cell, index) => {
            const boardCell = board[index];
            if (boardCell !== "") cell.classList.add(boardCell);
            else {
                cell.classList.remove("o");
                cell.classList.remove("x");
            }
        });
    }

    function setPlayer(symbol) {
        player = symbol;

        playerElem.innerHTML = `Você é o jogador ${player}`;

        if (player === "x") {
            boardElem.classList.remove("o");
            boardElem.classList.add("x");
        } else {
            boardElem.classList.remove("x");
            boardElem.classList.add("o");
        }
    }

    function setTurn(newTurn) {
        console.log(newTurn);
        turn = newTurn;
        if (turn === "x") {
            turnElem.innerHTML =
                player === "x" ? "Sua vez" : "Vez do jogador X";
        } else if (turn === "o") {
            turnElem.innerHTML =
                player === "o" ? "Sua vez" : "Vez do jogador O";
        } else {
            turnElem.innerHTML = "Jogo pausado";
        }
    }

    function changeStatus(status) {
        switch (status) {
            case "player_o_turn":
                statusElem.innerHTML =
                    player === "o" ? "Sua vez" : "Vez do jogador O";
                break;
            case "player_x_turn":
                statusElem.innerHTML =
                    player === "x" ? "Sua vez" : "Vez do jogador X";
                break;

            case "waiting_player_x":
                statusElem.innerHTML = "Aguardando jogador X";
                break;
            case "waiting_player_o":
                break;
            case "running":
                statusElem.innerHTML = "Em jogo";
                break;
            default:
            case "waiting_player":
                statusElem.innerHTML = "Aguardando jogador";
                break;
        }
    }

    function setupSocketListeners(_socket) {
        _socket.on("joined_game", (payload) => {
            localStorage.setItem(USER_ID_STORAGE, payload.userId);

            setPlayer(payload.player);
        });

        _socket.on("change_turn", (newTurn) => {
            setTurn(newTurn);
        });

        _socket.on("change_status", (newStatus) => {
            status = newStatus;

            changeStatus(newStatus);
        });

        _socket.on("update_board", (board) => {
            updateBoard(board);
        });
    }

    function checkStartUp() {
        gameId = document.location.pathname.split("/")?.[1];
        if (!gameId) {
            location.href = "/";
            return;
        }

        socket = io();

        const userId = localStorage.getItem(USER_ID_STORAGE);

        setupSocketListeners(socket);

        socket.emit("join_game", gameId, userId);

        setupEventListeners(socket);
    }

    checkStartUp();
})();
