#include "sortballs.h"
#include "game.h"
#include <iostream> // TODO: this is for testing purposes
#include <utility>
#include <vector>

using namespace std;

// TODO
vector<pair<unsigned int, unsigned int>> solve_game(deque<Game>& game_wl) {
    while (!game_wl.empty()) {
        Game game = game_wl.front();
        game_wl.pop_front();

        if (game.solved()) {
            return game.getMoves();
        }
        deque<Game> nexts = game.nextGames();
        nexts.insert(nexts.end(), game_wl.begin(), game_wl.end());
        game_wl = nexts;
        cout << "size: " << nexts.size() << "\n";
    }
    return {};
}


// TODO
int** sort_balls(int** game, int numCaps, int maxSize, int* resultSize) {
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