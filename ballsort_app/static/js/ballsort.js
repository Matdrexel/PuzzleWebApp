import { Game } from "./gameObjects.js";

document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("ballCanvas");
    const ctx = canvas.getContext("2d");
    
    // Ball properties
    let num_ball_colours = 10;

    // Capsule properties
    let max_size = 4;
    let num_caps = num_ball_colours + 2;
    let capsWidth = canvas.width / num_caps / 5 * 4;
    let capsHeight = canvas.height / 5 * 2;

    // Game Properties
    var gameOver = false;
    var game = new Game(canvas, num_caps, max_size, capsWidth, capsHeight);

    function setUpGame() {
        let balls = [];
        for (let i = 0; i < num_ball_colours; i++) {
            for (let j = 0; j < max_size; j++) {
                balls.push(i);
            }
        }
        let choose_balls = [];
        while (balls.length !== 0) {
            let index = Math.floor(Math.random() * balls.length)
            choose_balls.push(balls[index]);
            balls.splice(index, 1);
    
            if (choose_balls.length === max_size) {
                if (!game.add_balls(choose_balls)) {
                    throw new Error("Not enough capsules");
                }
                choose_balls = [];
            }
        }    
    }

    // Event listener for "Play Again" button
    document.getElementById("playAgainBtn").addEventListener("click", resetGame);

    // Event listener for "Undo" button
    document.getElementById("undoBtn").addEventListener("click", undoMove);

    // Event listeners for controls
    document.addEventListener("keydown", keyDownHandler);

    function keyDownHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
            game.move_horizontal(true);
        } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
            game.move_horizontal(false);
        } else if (e.key === "Down" || e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
            game.move_vertical(true);
        } else if (e.key === "Up" || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
            game.move_vertical(false);
        } else if (e.key === " ") {
            game.take_action();
        } else if (e.key === "u" || e.key === "U") {
            game.undo();
        }
        requestAnimationFrame(gameLoop);
        checkIfWon();
    }

    // Handle mouse click
    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        game.select_capsule(mouseX, mouseY);
        requestAnimationFrame(gameLoop);
        checkIfWon();
    });

    // checks whether the user has solved the puzzle
    function checkIfWon() {
        if (game.checkIfWon()) {
            gameOver = true;
            document.getElementById("winScreen").style.display = "block";
        }
    }

    // Resets the game if the user wants to
    function resetGame() {
        game = new Game(canvas, num_caps, max_size, capsWidth, capsHeight);
        setUpGame();
        gameOver = false;
        document.getElementById("winScreen").style.display = "none";
        requestAnimationFrame(gameLoop);
    }

    // Undoes the previous move if possible
    function undoMove() {
        game.undo();
        requestAnimationFrame(gameLoop);
    }

    // Handling c++ solve function:
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/socket-server/");

    // Wait for WebSocket to open before sending messages
    socket.onopen = function () {
        console.log("WebSocket connection established!");
        return false;
    };

    socket.onmessage = function(event) {
        let data = JSON.parse(event.data);
        let solution = data.solution
        
        let move_list = "Next moves:<br>";
        for (let i = 0; i < solution.length; i++) {
            let move = JSON.parse(solution[i]);
            move_list += "(" + move.from + "," + move.to + ")<br>"
        }
        document.getElementById("movelist").innerHTML = move_list;
    };

    function updateSolution(game) {
        if (socket.readyState === WebSocket.OPEN) {
            console.log("Made it here!");
            socket.send(game.toJson());
        } else if (socket.readyState === WebSocket.CONNECTING) {
            console.warn("WebSocket not open yet. Retrying in 5000ms...");
            setTimeout(() => updateSolution(game), 5000);
        } else {
            console.error(socket.readyState, WebSocket.CLOSED, WebSocket.CLOSING, WebSocket.OPEN)
        }
    }

    setInterval(() => updateSolution(game), 1000);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.draw(ctx, 0);
    }

    function gameLoop() {
        if (gameOver) return;
        draw();
    }

    setUpGame();
    requestAnimationFrame(gameLoop);
});