#ifndef GAME_H
#define GAME_H

#include <utility>
#include <vector>
#include <deque>

class Game {
    private:
        // TODO: remove after testing is done
        static inline int ID = 0;
        int this_ID;
        //
        std::vector<std::vector<int>> capsules;
        std::vector<bool> same_colour;
        std::vector<std::vector<std::vector<int>>> prev_moves; // TODO: improve this
        std::vector<std::pair<unsigned int, unsigned int>> moves;
        unsigned int maxSize;
        unsigned int numCaps;

        

    public:
        Game(int**, unsigned int, unsigned int);
        Game(Game, std::pair<unsigned int, unsigned int>);
        bool solved();
        std::vector<std::pair<unsigned int, unsigned int>> getMoves();
        std::deque<Game> nextGames();
};

#endif