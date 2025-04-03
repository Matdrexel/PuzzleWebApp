#include "sortballs.h"
#include "game.h"
#include <utility>
#include <vector>

using namespace std;

// Loop to find a solution to the ball sort game using brute force
vector<pair<unsigned int, unsigned int>> solveGame(deque<Game>& gameWL) {
    while (!gameWL.empty()) {
        Game game = gameWL.front();

        if (game.solved()) {
            return game.getMoves();
        }
        gameWL.pop_front();

        deque<Game> nexts = game.nextGames();
        nexts.insert(nexts.end(), gameWL.begin(), gameWL.end());
        gameWL = nexts;
    }
    return {};
}


// Finds a solution to the ball sort game and converts it into integer pointers
int** sortWater(int** game, int numCaps, int maxSize, int* resultSize) {
    Game newGame(game, numCaps, maxSize);
    deque<Game> gameWL; 
    gameWL.push_back(newGame);
    vector<pair<unsigned int, unsigned int>> moves = solveGame(gameWL);

    *resultSize = moves.size();
    int** res = new int*[*resultSize];

    for (unsigned int i = 0; i < *resultSize; i++) {
        res[i] = new int[2];
        res[i][0] = moves[i].first;
        res[i][1] = moves[i].second;
    }

    return res;
}