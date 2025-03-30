#include "solve.h"
#include "sortballs.h"

// see "sortballs.cpp" for solution function
int** ball_solution(int** game, int numCaps, int maxSize, int* resultSize) {
    return sort_water(game, numCaps, maxSize, resultSize);
}

// frees the memory associated with a doubly indirect pointer
void free_memory(int** obj, int size) {
    for (int i = 0; i < size; i++) {
        delete[] obj[i];
    }
    delete[] obj;
}