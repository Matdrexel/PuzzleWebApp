class Capsule {
    balls;
    max_size;
    static colour_dict = new Map([
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
        [10, "black"],
        [11, "lawngreen"]]);

    static get_colour(n) {
        if (this.colour_dict.has(n))
            return this.colour_dict.get(n);
        return "white";
    }


    constructor(ball_array, max_size) {
        this.max_size = max_size;
        if (ball_array.length > max_size)
            throw new Error("Too many balls");

        this.balls = [...ball_array];
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
        if (this.balls.length === this.max_size) 
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
        if (this.balls.length === this.max_size)
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
        if (this.balls.length !== this.max_size)
            return false;

        let colour = this.balls[0];
        for (let i = 1; i < this.balls.length; i++)
            if (colour != this.balls[i])
                return false;
        
        return true;
    }

    draw(ctx, x, y, height, width, selected) {
        for (let i = 0; i < this.balls.length; i++) {
            let radius = width / 5 * 2;

            ctx.beginPath();
            if (selected && (i === this.balls.length - 1))
                ctx.arc(x + width / 2, y, radius, 0, Math.PI * 2);
            else
                ctx.arc(x + width / 2, y + height - radius - 2 * i * radius, radius, 0, Math.PI * 2);

            ctx.fillStyle = Capsule.get_colour(this.balls[i]);
            ctx.fill();
            ctx.closePath();
        }
    }
    
    toJson() {
        let jsonArray = []
        for (let i = 0; i < this.max_size; i++) {
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
    #capsule_locations; // contains tuples with 0 being x-pos and 1 being y-pos
    #capsWidth;
    #capsHeight;
    #column;
    #row;
    #active_index;
    #prev_moves; // contains tuples with 0 being the from-index and 1 being the to-index


    constructor(canvas, num_capsules, max_size, width, height) {
        this.#capsules = [];
        this.#capsule_locations = [];
        for (let i = 0; i < num_capsules; i++) {
            this.#capsules.push(new Capsule([], max_size));
            if (i % 2 === 0)
                this.#capsule_locations.push([((i / 2) + 0.25) * canvas.width / num_capsules * 2, canvas.height / 10]);
            else
                this.#capsule_locations.push([(((i - 1) / 2) + 0.25) * canvas.width / num_capsules * 2, canvas.height / 6 + height]);
        }
        this.#capsHeight = height;
        this.#capsWidth = width;
        this.#column = 0;
        this.#row = 0;
        this.#active_index = -1;
        this.#prev_moves = [];
    }

    // add an array of balls to a capsule
    // returns true if there is an empty capsule to add them to, and false otherwise
    add_balls(ball_array) {
        for (let i = 0; i < this.#capsules.length; i++) {
            if (this.#capsules[i].isEmpty()) {
                this.#capsules[i] = new Capsule(ball_array, this.#capsules[i].max_size);
                return true;
            }
        }
        return false;
    }

    // moves left or right through the selected capsules if possible
    move_horizontal(right) {
        if (right) {
            if ((2 * (this.#column + 1)) < this.#capsules.length)
                this.#column++;
        } else {
            if (this.#column > 0)
                this.#column--;
        }
    }

    // moves up or down through the selected capsules if possible
    move_vertical(down) {
        if (down) {
            this.#row = 1;
        } else {
            this.#row = 0;
        }
    }

    // selects the capsule at the specified location if it exists
    // then calls take_action
    select_capsule(mouseX, mouseY) {
        for (let i = 0; i < this.#capsule_locations.length; i++) {
            let x_threshhold = this.#capsule_locations[i][0];
            let y_threshhold = this.#capsule_locations[i][1];
            if ((x_threshhold <= mouseX && mouseX <= x_threshhold + this.#capsWidth) && (y_threshhold <= mouseY && mouseY <= y_threshhold + this.#capsHeight)) {
                this.#column = Math.floor(i / 2);
                this.#row = i % 2;
                this.take_action();
                break;
            }
        }
    }

    // Does one of the specified actions:
    // If no capsule is active, sets the active index to the currently selected capsule
    // If currently selected capsule is active, unactivates the capsule
    // Otherwise, attempts to move the top ball of the active capsule to the selected capsule
    take_action() {
        if (this.#active_index === -1)
            this.#active_index = this.#column * 2 + this.#row;
        else if (this.#active_index === this.#column * 2 + this.#row)
            this.#active_index = -1;
        else {
            let active_ball = this.#capsules[this.#active_index].getBall();
            if (active_ball !== -1) {
                if (this.#capsules[this.#column * 2 + this.#row].setBall(active_ball)) {
                    this.#capsules[this.#active_index].removeBall();
                    this.#prev_moves.push([this.#active_index, this.#column * 2 + this.#row]);
                }
                this.#active_index = -1;
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
        if (this.#prev_moves.length > 0) {
            let prev_move = this.#prev_moves.pop();
            this.#capsules[prev_move[0]].forceSetBall(this.#capsules[prev_move[1]].getBall());
            this.#capsules[prev_move[1]].removeBall();
            this.#column = Math.floor(prev_move[0] / 2);
            this.#row = prev_move[0] % 2;
        }
        this.#active_index = -1;
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

    #drawCapsule(ctx, x, y, selected) {

        ctx.save();

        if (selected) {
            // Add a gold glow effect
            ctx.shadowColor = "rgba(255, 215, 0, 1)"; // Gold glow with transparency
            ctx.shadowBlur = 25; // Blur intensity
            ctx.lineWidth = 15;
            ctx.strokeStyle = "rgba(255, 215, 0, 0.2)";
            ctx.beginPath();
            this.#drawRectangle(ctx, x, y);
            ctx.stroke();
        }

        ctx.restore();

        ctx.strokeStyle = "white"; 
        ctx.lineWidth = 3; // Normal stroke thickness

        ctx.beginPath();
        this.#drawRectangle(ctx, x, y);
        ctx.stroke();
    }

    draw(ctx) {
        for (let i = 0; i < this.#capsules.length / 2; i++) {
            this.#drawCapsule(ctx, this.#capsule_locations[2 * i][0], this.#capsule_locations[2 * i][1], (this.#column == i) && (this.#row == 0));
            this.#capsules[2 * i].draw(ctx, this.#capsule_locations[2 * i][0], this.#capsule_locations[2 * i][1], this.#capsHeight, this.#capsWidth, this.#active_index === 2 * i);

            if (2 * i + 1 < this.#capsules.length) {
                this.#drawCapsule(ctx, this.#capsule_locations[2 * i + 1][0], this.#capsule_locations[2 * i + 1][1], (this.#column == i) && (this.#row == 1));
                this.#capsules[2 * i + 1].draw(ctx, this.#capsule_locations[2 * i + 1][0], this.#capsule_locations[2 * i + 1][1], this.#capsHeight, this.#capsWidth, this.#active_index == 2 * i + 1);
            }
        }
    }

    // Converts Game object to JSON for python to operate on it
    toJson() {
        let jsonArray = [];
        for (let i = 0; i < this.#capsules.length; i++)
            jsonArray.push(this.#capsules[i].toJson());
        
        return JSON.stringify({"balls": jsonArray, "max_size" : this.#capsules[0].max_size});
    }
}

export { Game };