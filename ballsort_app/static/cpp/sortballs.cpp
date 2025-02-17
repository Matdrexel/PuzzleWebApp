#include "sortballs.h"
#include <vector>
#include <iostream> // TODO: this is for testing purposes

// Converts a game instance into a vector of 
std::vector<std::vector<int>> convert_balls(int** game, int numCaps, int maxSize) {
    std::vector<std::vector<int>> new_game;
    for (int i = 0; i < numCaps; i++) {
        std::vector<int> capsule;
        for (int j = 0; j < maxSize; j++) {
            if (game[i][j] == -1) {
                break;
            }
            capsule.push_back(game[i][j]);
        }
        new_game.push_back(capsule);
    }
    return new_game;
}

// TODO: temporary test function. Needs to be modified
int** sort_balls(int** game, int numCaps, int maxSize, int* resultSize) {
    std::vector<std::vector<int>> vec_game = convert_balls(game, numCaps, maxSize);
    *resultSize = 3;
    int** res = new int*[*resultSize];

    for (int i = 0; i < *resultSize; i++) {
        res[i] = new int[2];
        res[i][0] = 0;
        res[i][1] = 1;
    }

    return res;
}