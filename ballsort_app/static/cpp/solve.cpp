#include "solve.h"
#include "sortballs.h"

int** ball_solution(int** game, int numCaps, int maxSize, int* resultSize) {
    return sort_balls(game, numCaps, maxSize, resultSize);
}

void free_memory(int** obj) {
    
}