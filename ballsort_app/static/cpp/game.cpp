#include "game.h"

using namespace std;

// creates a new game by converting a doubly indirect integer pointer into a vector
Game::Game(int** game, unsigned int numCaps, unsigned int maxSize) {
    for (unsigned int i = 0; i < numCaps; i++) {
        vector<pair<int, unsigned int>> capsule;
        pair<int, unsigned int> water = {-1, 0};
        unsigned int total = 0;
        for (unsigned int j = 0; j < maxSize; j++) {
            if (game[i][j] == -1)
                break;
            
            total++;
            if (water.first == game[i][j]) {
                water.second++;
            } else {
                if (water.first != -1)
                    capsule.push_back(water);

                water = {game[i][j], 1};
            }
        }
        if (water.first != -1)
            capsule.push_back(water);
        
        capsules.push_back({capsule, total});
    }
    this->maxSize = maxSize;
    this->numCaps = numCaps;
}

// CONSTRAINT: move must be valid
// creates a new game after moving the water from the first index to the second index in move
Game::Game(Game game, pair<unsigned int, unsigned int> move) {
    this->maxSize = game.maxSize;
    this->numCaps = game.numCaps;
    this->capsules = game.capsules;
    this->moves = game.moves;

    for (unsigned int i = 0; i < game.capsules[move.first].first.back().second; i++)
        this->moves.push_back(move);

    if (this->capsules[move.second].second == 0) {
        this->capsules[move.second].first.push_back(this->capsules[move.first].first.back());
    } else {
        this->capsules[move.second].first.back().second += this->capsules[move.first].first.back().second;
    }

    this->capsules[move.second].second += this->capsules[move.first].first.back().second;
    this->capsules[move.first].second -= this->capsules[move.first].first.back().second;
    this->capsules[move.first].first.pop_back();

}

// returns the moves made in this game
vector<pair<unsigned int, unsigned int>> Game::getMoves() {
    return moves;
}

// Semi-optimized brute force method of producing all possible moves that can be made
deque<Game> Game::nextGames() {
    deque<Game> result;
    for (unsigned int i = 0; i < numCaps; i++) {
        // ensure capsule is non-empty
        if (capsules[i].second != 0) {
            pair<int, unsigned int> try_water = capsules[i].first.back();
            // make sure that capsule is not full/almost full
            if (try_water.second < maxSize) {
                int empty = -1;
                for (unsigned int j = 0; j < numCaps; j++) {
                    // don't move water back into the same capsule it started
                    if (i == j)
                        continue;
                    // record a maximum of one empty capsule
                    else if (capsules[j].second == 0)
                        empty = j;
                    // only move water into a capsule with the same coloured top water and make sure water fits
                    else if ((capsules[j].first.back().first == try_water.first) && (capsules[j].second + try_water.second <= maxSize)) {
                        Game new_game(*this, {i, j});
                        result.push_back(new_game);
                    }
                }
                // handles moving water into an empty capsule
                if ((empty != -1) && (capsules[i].first.size() != 1)) {
                    Game new_game(*this, {i, empty});
                    result.push_back(new_game);
                }
            }
        }
    }
    return result;
}

// returns true if the game is solved
bool Game::solved() {
    for (unsigned int i = 0; i < numCaps; i++) {
        if (capsules[i].first.size() > 1)
            return false;

        if (capsules[i].second != 0) {
            if (capsules[i].first[0].second != maxSize)
                return false;
        }
    }
    return true;
}