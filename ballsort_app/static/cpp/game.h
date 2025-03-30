#ifndef GAME_H
#define GAME_H

#include <utility>
#include <vector>
#include <deque>

class Game {
    private:
        // capsules[i].first is the water within the capsule
        // capsules[i].second is the real volume of the capsule
        // capsules[i].first[j].first is the colour of the water
        // capsules[i].first[j].second is the volume of that chunk of water
        std::vector<std::pair<std::vector<std::pair<int, unsigned int>>, unsigned int>> capsules;
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