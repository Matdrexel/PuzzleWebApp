#ifndef SORTBALLS_H
#define SORTBALLS_H

#include "game.h"
#include <utility>
#include <vector>
#include <deque>

std::vector<std::pair<unsigned int, unsigned int>> solve_game(std::deque<Game>&);
int** sort_water(int**, int, int, int*);

#endif