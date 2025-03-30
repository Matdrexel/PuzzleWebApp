#include "sortballs.h"
#include "game.h"
#include <utility>
#include <vector>

using namespace std;

// Loop to find a solution to the ball sort game using brute force
vector<pair<unsigned int, unsigned int>> solve_game(deque<Game>& game_wl) {
    while (!game_wl.empty()) {
        Game game = game_wl.front();

        if (game.solved()) {
            return game.getMoves();
        }
        game_wl.pop_front();

        deque<Game> nexts = game.nextGames();
        nexts.insert(nexts.end(), game_wl.begin(), game_wl.end());
        game_wl = nexts;
    }
    return {};
}


// Finds a solution to the ball sort game and converts it into integer pointers
int** sort_water(int** game, int numCaps, int maxSize, int* resultSize) {
    Game new_game(game, numCaps, maxSize);
    deque<Game> game_wl; 
    game_wl.push_back(new_game);
    vector<pair<unsigned int, unsigned int>> moves = solve_game(game_wl);

    *resultSize = moves.size();
    int** res = new int*[*resultSize];

    for (unsigned int i = 0; i < *resultSize; i++) {
        res[i] = new int[2];
        res[i][0] = moves[i].first;
        res[i][1] = moves[i].second;
    }

    return res;
}