import { Game } from "./gameObjects.js";

document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("ballCanvas");
    const ctx = canvas.getContext("2d");

    // Event Listener for Ball Colours Slider
    document.getElementById("ballColours").addEventListener("input", function() {
        document.getElementById("ballColoursValue").textContent = document.getElementById("ballColours").value;
    });

    // Event Listener for Capsule Height Slider
    document.getElementById("capsuleHeight").addEventListener("input", function() {
        document.getElementById("capsuleHeightValue").textContent = document.getElementById("capsuleHeight").value;
    });

    // Event listener for Start Game button
    document.getElementById("startGameBtn").addEventListener("click", startGame);

    // Event listener for Play Again button
    document.getElementById("playAgainBtn").addEventListener("click", resetGame);

    // Event listener for Undo button
    document.getElementById("undoBtn").addEventListener("click", undoMove);

    // Event listener for Hint button
    document.getElementById("hintBtn").addEventListener("click", nextHint);

    // Event listeners for controls
    document.addEventListener("keydown", keyDownHandler);

    // Game Properties
    var gameOver = true;
    var hint = [];
    var hintAnimation = false;
    var game = null;

    // Begins the game using the user selected number of ball colours and capsule height
    function startGame() {
        let numBallColours = parseInt(document.getElementById("ballColours").value);
        let maxSize = parseInt(document.getElementById("capsuleHeight").value);
        let numCaps = numBallColours + 2;
        let capsWidth = Math.min(((canvas.width / numCaps) / maxSize) * 3.2, canvas.height / 2.1 / maxSize);
        let capsHeight = capsWidth * maxSize * 0.9;

        game = new Game(canvas, numCaps, maxSize, capsWidth, capsHeight);
        setUpGame(numBallColours, maxSize);

        document.getElementById("customizationScreen").style.display = "none";
        
        gameOver = false;
        requestAnimationFrame(gameLoop);
    }

    function setUpGame(numBallColours, maxSize) {
        let balls = [];
        for (let i = 0; i < numBallColours; i++) {
            for (let j = 0; j < maxSize; j++) {
                balls.push(i);
            }
        }
        let chooseBalls = [];
        while (balls.length !== 0) {
            let index = Math.floor(Math.random() * balls.length)
            chooseBalls.push(balls[index]);
            balls.splice(index, 1);
    
            if (chooseBalls.length === maxSize) {
                if (!game.addBalls(chooseBalls)) {
                    throw new Error("Not enough capsules");
                }
                chooseBalls = [];
            }
        }    
    }

    // Handles key presses
    function keyDownHandler(e) {
        if (gameOver)
            return;
        hint = [];

        if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
            e.preventDefault();
            game.moveHorizontal(true);
        } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
            e.preventDefault();
            game.moveHorizontal(false);
        } else if (e.key === "Down" || e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
            e.preventDefault();
            game.moveVertical(true);
        } else if (e.key === "Up" || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
            e.preventDefault();
            game.moveVertical(false);
        } else if (e.key === " ") {
            e.preventDefault();
            game.takeAction();
        } else if (e.key === "u" || e.key === "U") {
            e.preventDefault();
            undoMove();
        }
        requestAnimationFrame(gameLoop);
        checkIfWon();
    }

    // Handles mouse clicks
    canvas.addEventListener("click", (event) => {
        // gaurd for when game is not being played
        if (gameOver)
            return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        game.selectCapsule(mouseX, mouseY);
        hint = [];
        requestAnimationFrame(gameLoop);
        checkIfWon();
    });

    // Checks whether the user has solved the puzzle
    function checkIfWon() {
        if (game.checkIfWon()) {
            setTimeout(() => {
                gameOver = true;
                document.getElementById("winScreen").style.display = "block";
            }, 10);
        }
    }

    // Resets the game if the user wants to
    function resetGame() {
        game = null;
        gameOver = true;
        hint = [];
        document.getElementById("winScreen").style.display = "none";
        document.getElementById("customizationScreen").style.display = "block";
    }

    // Undoes the previous move if possible
    function undoMove() {
        if (gameOver)
            return;

        game.undo();
        hint = [];
        requestAnimationFrame(gameLoop);
    }

    // Handling c++ solve function:
    const protocal = window.location.protocal === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const socket = new WebSocket(`${protocal}//${host}/ws/socket-server/`);

    // Wait for WebSocket to open before sending messages
    socket.onopen = function () {
        console.log("WebSocket connection established!");
        return false;
    };

    // Updates the hint list for the game
    socket.onmessage = function(event) {
        game.parseSolution(event.data);
        hint = game.getHint();

        if (hint[0] === -1) {
            hint = [];
            document.getElementById("movelist").innerHTML = "Sorry, this puzzle is unsolvable :(";
        } else {
            nextMove();
        }
    };

    // Sends the game data to the server to update the game hint list
    function updateSolution() {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(game.toJson());
            document.getElementById("movelist").innerHTML = "Loading Hint..."
        } else if (socket.readyState === WebSocket.CONNECTING) {
            console.warn("WebSocket not open yet. Retrying in 5000ms...");
            setTimeout(() => updateSolution(game), 5000);
        } else {
            console.error(socket.readyState, WebSocket.CLOSED, WebSocket.CLOSING, WebSocket.OPEN)
        }
    }

    // Produces the next hint
    function nextHint() {
        // guard for before the game starts or after the game ends
        if (gameOver)
            return;

        hint = game.getHint();
        if (hint[0] === -1) {
            hint = [];
            updateSolution();
        } else {
            if (!hintAnimation)
                nextMove();
        }
    }

    // Flash capsules for a hint
    function nextMove() {
        document.getElementById("movelist").innerHTML = "Next move: (" + hint[0] + "," + hint[1] + ")";
        requestAnimationFrame(gameLoop);
    }

    // Draw functions
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (hint.length === 0)
            game.draw(ctx, -1);
        else {
            hintAnimation = true;
            game.draw(ctx, hint[0]);
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                game.draw(ctx, -1);
                setTimeout(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    game.draw(ctx, hint.length === 0 ? -1 : hint[1]);
                    setTimeout(() => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        game.draw(ctx, -1);
                        hintAnimation = false;
                    }, 1000);
                }, 500);
            }, 1000);
        }
    }

    function gameLoop() {
        if (gameOver) return;
        draw();
    }

    document.getElementById("customizationScreen").style.display = "block";
});