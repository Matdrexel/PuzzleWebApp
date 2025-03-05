#include "game.h"
#include <iostream> // TODO: remove after finished testing

using namespace std;

// creates a new game by converting a doubly indirect integer pointer into a vector
Game::Game(int** game, unsigned int numCaps, unsigned int maxSize) {
    for (unsigned int i = 0; i < numCaps; i++) {
        vector<int> capsule;
        bool same = true;
        for (unsigned int j = 0; j < maxSize; j++) {
            if (game[i][j] == -1)
                break;

            capsule.push_back(game[i][j]);

            if (j > 0)
                same = same && capsule[j] == capsule[j - 1];
        }
        same_colour.push_back(same);
        capsules.push_back(capsule);
    }
    this->maxSize = maxSize;
    this->numCaps = numCaps;
}

// CONSTRAINT: move must be valid
// creates a new game after moving the ball from the first index to the second index in move
Game::Game(Game game, pair<unsigned int, unsigned int> move) {
    // TODO for testing
    this->this_ID = ID;
    ID++; 
    cout << ID << " (" << move.first << "," << move.second << ")\n";
    // TODO for testing

    this->maxSize = game.maxSize;
    this->numCaps = game.numCaps;
    this->capsules = game.capsules;
    this->moves = game.moves;
    this->same_colour = game.same_colour;
    this->prev_moves = game.prev_moves;
    
    this->prev_moves.insert(game.capsules);

    this->moves.push_back(move);
    this->capsules[move.second].push_back(this->capsules[move.first].back());
    this->capsules[move.first].pop_back();

    if (this->capsules[move.first].size() == 0) {
        this->same_colour[move.first] = true;
    } else {
        bool same = true;
        for (unsigned int i = 1; i < this->capsules[move.first].size(); i++) {
            if (this->capsules[move.first][i] != this->capsules[move.first][0]) {
                same = false;
                break;
            }
        }
        this->same_colour[move.first] = same;
    }
    
    bool same = true;
    for (unsigned int i = 1; i < this->capsules[move.second].size(); i++) {
        if (this->capsules[move.second][i] != this->capsules[move.second][0]) {
            same = false;
            break;
        }
    }
    this->same_colour[move.second] = same;
}

// returns the moves made in this game
vector<pair<unsigned int, unsigned int>> Game::getMoves() {
    return moves;
}

// Semi-optimized brute force method of producing all possible moves that can be made
// TODO: prevent branches where balls are being moved back and forth between capsules in between other moves
deque<Game> Game::nextGames() {
    deque<Game> result;
    for (unsigned int i = 0; i < numCaps; i++) {
        // this removes cases where a capsule is full or one away from being full of one colour from being emptied
        if (!same_colour[i] || ((capsules[i].size() < maxSize - 1) && (capsules[i].size() != 0))) {
            int try_ball = capsules[i].back();
            int empty = -1;
            for (unsigned int j = 0; j < numCaps; j++) {
                // don't move balls back into the same capsule it started
                if (i == j)
                    continue;
                // don't add balls to a full capsule
                else if (capsules[j].size() == maxSize)
                    continue;
                // record a maximum of one empty capsule
                else if (capsules[j].size() == 0) 
                    empty = j;
                // only move ball into a capsule with the same coloured top ball
                else if (capsules[j].back() == try_ball) {
                    pair<unsigned int, unsigned int> move = {i, j};
                    Game new_game(*this, move);
                    // only add this as a move if the new game has not already been seen in the path
                    if (prev_moves.find(new_game.capsules) == prev_moves.end()) {
                        result.push_back(new_game);
                    }
                }
            }
            // prevent moving a ball in a capsule with only one capsule to an empty capsule
            if (empty != -1 && !same_colour[i]) {
                pair<unsigned int, unsigned int> move = {i, empty};
                Game new_game(*this, move);
                result.push_back(new_game);
            }
        }
    }
    return result;
}

// returns true if the game is solved
bool Game::solved() {
    for (unsigned int i = 0; i < numCaps; i++)
        if (!same_colour[i] || (capsules[i].size() != 0 && capsules[i].size() != maxSize))
            return false;
    return true;
}