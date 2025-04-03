class Capsule {
    balls;
    maxSize;
    static colourDict = new Map([
        [0, "red"],
        [1, "blue"],
        [2, "green"],
        [3, "orange"],
        [4, "yellow"],
        [5, "purple"],
        [6, "pink"],
        [7, "grey"],
        [8, "darkslateblue"],
        [9, "brown"],
        [10, "white"],
        [11, "lawngreen"],
        [12, "cyan"],
        [13, "crimson"],
        [14, "coral"],
        [15, "khaki"]]);

    static getColour(n) {
        if (this.colourDict.has(n))
            return this.colourDict.get(n);
        return "black";
    }


    constructor(ballArray, maxSize) {
        this.maxSize = maxSize;
        if (ballArray.length > maxSize)
            throw new Error("Too many balls");

        this.balls = [...ballArray];
    }
    
    // returns the top ball, or -1 if the capsule is empty
    getBall() {
        if (this.balls.length === 0)
            return -1;
        return this.balls[this.balls.length - 1];
    }

    // attempts to add the ball parameter to the capsule
    // returns true if successful and false if failed
    setBall(ball) {
        if (this.balls.length === this.maxSize) 
            return false;

        if ((this.balls.length !== 0) && (this.balls[this.balls.length - 1] !== ball))
            return false;

        this.balls.push(ball);
        return true;
    }

    // forces the ball to the top of the capsule
    // throws an error if the capsule overflows
    // this function should only be called when undo-ing a previous move
    forceSetBall(ball) {
        if (this.balls.length === this.maxSize)
            throw new Error("Undo caused an issue");
        this.balls.push(ball);
    }

    // removes the top ball, if one exists
    removeBall() {
        if (this.balls.length !== 0)
            this.balls.pop();
    }

    // returns true if ball
    isEmpty() {
        return this.balls.length === 0;
    }

    // returns true if capsule is empty or capsule is full with only one coloured ball
    isComplete() {
        if (this.isEmpty())
            return true;
        if (this.balls.length !== this.maxSize)
            return false;

        let colour = this.balls[0];
        for (let i = 1; i < this.balls.length; i++)
            if (colour != this.balls[i])
                return false;
        
        return true;
    }

    // renders all balls in this capsule
    draw(ctx, x, y, height, width, selected) {
        for (let i = 0; i < this.balls.length; i++) {
            let radius = width / 5 * 2;

            ctx.beginPath();
            if (selected && (i === this.balls.length - 1))
                ctx.arc(x + width / 2, y, radius, 0, Math.PI * 2);
            else
                ctx.arc(x + width / 2, y + height - radius - 2 * i * radius, radius, 0, Math.PI * 2);

            ctx.fillStyle = Capsule.getColour(this.balls[i]);
            ctx.fill();
            ctx.closePath();
        }
    }
    
    toJson() {
        let jsonArray = []
        for (let i = 0; i < this.maxSize; i++) {
            if (i < this.balls.length)
                jsonArray.push(JSON.stringify({"ball": this.balls[i]}));
            else
                jsonArray.push(JSON.stringify({"ball": -1}));
        }

        return JSON.stringify({"balls" : jsonArray})
    }
}

class Game {
    #capsules;
    #capsuleLocations; // contains tuples with 0 being x-pos and 1 being y-pos
    #capsWidth;
    #capsHeight;
    #column;
    #row;
    #activeIndex;
    #prevMoves; // contains tuples with 0 being the from-index and 1 being the to-index
    #solution; // the solution provided by the hint
    #solutionIndex;


    constructor(canvas, numCapsules, maxSize, width, height) {
        this.#capsules = [];
        this.#capsuleLocations = [];
        for (let i = 0; i < numCapsules; i++) {
            this.#capsules.push(new Capsule([], maxSize));
            if (i % 2 === 0)
                this.#capsuleLocations.push([((i / 2) + 0.25) * canvas.width / (Math.ceil(numCapsules / 2) * 2) * 2, (canvas.height / 2) - height - 10]);
            else
                this.#capsuleLocations.push([(((i - 1) / 2) + 0.25) * canvas.width / (Math.ceil(numCapsules / 2) * 2) * 2, canvas.height - height - 10]);
        }
        this.#capsHeight = height;
        this.#capsWidth = width;
        this.#column = 0;
        this.#row = 0;
        this.#activeIndex = -1;
        this.#prevMoves = [];
        this.#solution = [];
        this.#solutionIndex = 0;
    }

    // add an array of balls to a capsule
    // returns true if there is an empty capsule to add them to, and false otherwise
    addBalls(ballArray) {
        for (let i = 0; i < this.#capsules.length; i++) {
            if (this.#capsules[i].isEmpty()) {
                this.#capsules[i] = new Capsule(ballArray, this.#capsules[i].maxSize);
                return true;
            }
        }
        return false;
    }

    // moves left or right through the selected capsules if possible
    moveHorizontal(right) {
        if (right) {
            if ((2 * (this.#column + 1)) < this.#capsules.length)
                this.#column++;
        } else {
            if (this.#column > 0)
                this.#column--;
        }
    }

    // moves up or down through the selected capsules if possible
    moveVertical(down) {
        if (down) {
            this.#row = 1;
        } else {
            this.#row = 0;
        }
    }

    // selects the capsule at the specified location if it exists
    // then calls takeAction
    selectCapsule(mouseX, mouseY) {
        for (let i = 0; i < this.#capsuleLocations.length; i++) {
            let xThreshhold = this.#capsuleLocations[i][0];
            let yThreshhold = this.#capsuleLocations[i][1];
            if ((xThreshhold <= mouseX && mouseX <= xThreshhold + this.#capsWidth) && (yThreshhold <= mouseY && mouseY <= yThreshhold + this.#capsHeight)) {
                this.#column = Math.floor(i / 2);
                this.#row = i % 2;
                this.takeAction();
                break;
            }
        }
    }

    // Does one of the specified actions:
    // If no capsule is active, sets the active index to the currently selected capsule
    // If currently selected capsule is active, unactivates the capsule
    // Otherwise, attempts to move the top ball of the active capsule to the selected capsule
    takeAction() {
        if (this.#activeIndex === -1)
            this.#activeIndex = this.#column * 2 + this.#row;
        else if (this.#activeIndex === this.#column * 2 + this.#row)
            this.#activeIndex = -1;
        else {
            let activeBall = this.#capsules[this.#activeIndex].getBall();
            if (activeBall !== -1) {
                if (this.#capsules[this.#column * 2 + this.#row].setBall(activeBall)) {
                    this.#capsules[this.#activeIndex].removeBall();
                    if ((this.#solutionIndex >= 0) && (this.#solutionIndex < this.#solution.length)) {
                        let hintMove = this.#solution[this.#solutionIndex];
                        if ((hintMove[0] === this.#activeIndex) && (hintMove[1] === this.#column * 2 + this.#row))
                            this.#solutionIndex++;
                        else
                            this.#solutionIndex = -1;
                    }
                    this.#prevMoves.push([this.#activeIndex, this.#column * 2 + this.#row]);
                }
                this.#activeIndex = -1;
            }
        }
    }

    // returns true if all the balls are sorted
    checkIfWon() {
        for (let i = 0; i < this.#capsules.length; i++)
            if (!this.#capsules[i].isComplete())
                return false;
        return true;
    }

    // undoes the previous action if possible
    undo() {
        if (this.#prevMoves.length > 0) {
            let prevMove = this.#prevMoves.pop();
            this.#capsules[prevMove[0]].forceSetBall(this.#capsules[prevMove[1]].getBall());
            this.#capsules[prevMove[1]].removeBall();
            this.#column = Math.floor(prevMove[0] / 2);
            this.#row = prevMove[0] % 2;

            if (this.#solution.length > 0) {
                if (this.#solutionIndex > 0)
                    this.#solutionIndex--;
                else if (this.#solutionIndex === 0)
                    this.#solution.unshift(prevMove);
            }
        }
        this.#activeIndex = -1;
    }

    // converts the JSON solution into a list of moves
    parseSolution(jsonSolution) {
        this.#solution = [];
        let data = JSON.parse(jsonSolution).solution;

        for (let i = 0; i < data.length; i++) {
            let move = JSON.parse(data[i]);
            this.#solution.push([move.from, move.to]);
        }
        
        this.#solutionIndex = 0;
    }

    // produces the latest move if possible
    getHint() {
        if ((this.#solution.length == 0) || (this.#solutionIndex < 0) || (this.#solutionIndex >= this.#solution.length)) {
            return [-1,-1]
        }
        return this.#solution[this.#solutionIndex];
    }

    // Draw functions:
    #drawRectangle(ctx, x, y) {
        let radius = 10;
        ctx.moveTo(x + this.#capsWidth, y);
        ctx.lineTo(x + this.#capsWidth, y + this.#capsHeight - radius);
        ctx.arcTo(x + this.#capsWidth, y + this.#capsHeight, x + this.#capsWidth - radius, y + this.#capsHeight, radius);
        ctx.lineTo(x + radius, y + this.#capsHeight);
        ctx.arcTo(x, y + this.#capsHeight, x, y + this.#capsHeight - radius, radius);
        ctx.lineTo(x, y);
    }

    // Draws a capsule
    // Highlights the capsule depending on whether its selected or if there is a hint involving this capsule
    #drawCapsule(ctx, x, y, selected, hinted) {
        ctx.save();

        if (hinted) {
            ctx.shadowColor = "rgba(255, 255, 0, 1)";
            ctx.shadowBlur = 30; 
            ctx.lineWidth = 15;
            ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
            ctx.beginPath();
            this.#drawRectangle(ctx, x, y);
            ctx.stroke();
        } else if (selected) {
            ctx.shadowColor = "rgba(255, 215, 0, 1)";
            ctx.shadowBlur = 25;
            ctx.lineWidth = 15;
            ctx.strokeStyle = "rgba(255, 215, 0, 0.2)";
            ctx.beginPath();
            this.#drawRectangle(ctx, x, y);
            ctx.stroke();
        }

        ctx.restore();

        ctx.strokeStyle = "white"; 
        ctx.lineWidth = 3;

        ctx.beginPath();
        this.#drawRectangle(ctx, x, y);
        ctx.stroke();
    }

    // Draws the game
    draw(ctx, hinted) {
        for (let i = 0; i < this.#capsules.length / 2; i++) {
            this.#drawCapsule(ctx, this.#capsuleLocations[2 * i][0], this.#capsuleLocations[2 * i][1], (this.#column == i) && (this.#row == 0), hinted === 2 * i);
            this.#capsules[2 * i].draw(ctx, this.#capsuleLocations[2 * i][0], this.#capsuleLocations[2 * i][1], this.#capsHeight, this.#capsWidth, this.#activeIndex === 2 * i);

            if (2 * i + 1 < this.#capsules.length) {
                this.#drawCapsule(ctx, this.#capsuleLocations[2 * i + 1][0], this.#capsuleLocations[2 * i + 1][1], (this.#column == i) && (this.#row == 1), hinted === 2 * i + 1);
                this.#capsules[2 * i + 1].draw(ctx, this.#capsuleLocations[2 * i + 1][0], this.#capsuleLocations[2 * i + 1][1], this.#capsHeight, this.#capsWidth, this.#activeIndex == 2 * i + 1);
            }
        }
    }

    // Converts Game object to JSON for python to operate on it
    toJson() {
        let jsonArray = [];
        for (let i = 0; i < this.#capsules.length; i++)
            jsonArray.push(this.#capsules[i].toJson());
        
        return JSON.stringify({"balls": jsonArray, "maxSize" : this.#capsules[0].maxSize});
    }
}

export { Game };