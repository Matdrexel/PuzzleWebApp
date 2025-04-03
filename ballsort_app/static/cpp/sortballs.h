#ifndef SORTBALLS_H
#define SORTBALLS_H

#include "game.h"
#include <utility>
#include <vector>
#include <deque>

std::vector<std::pair<unsigned int, unsigned int>> solveGame(std::deque<Game>&);
int** sortWater(int**, int, int, int*);

#endif