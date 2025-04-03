#include "solve.h"
#include "sortballs.h"

// see "sortballs.cpp" for solution function
int** ballSolution(int** game, int numCaps, int maxSize, int* resultSize) {
    return sortWater(game, numCaps, maxSize, resultSize);
}

// frees the memory associated with a doubly indirect pointer
void freeMemory(int** obj, int size) {
    for (int i = 0; i < size; i++) {
        delete[] obj[i];
    }
    delete[] obj;
}