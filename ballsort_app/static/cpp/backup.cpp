// .h
#ifndef SOLVE_H
#define SOLVE_H

// Define an EXPORT macro to handle symbol exporting on Windows.
// On non-Windows systems, the macro can be empty.
#ifdef _WIN32
    #define EXPORT __declspec(dllexport)
#else
    #define EXPORT
#endif


// Use extern "C" to prevent C++ name mangling.
extern "C" {

    int** EXPORT ball_solution(int**, int, int);

    void EXPORT free_memory(int**);
}

#endif

//.cpp
#include "solve.h"
#include "sortballs.h"

int** ball_solution(int** game, int numCaps, int maxSize, int* resultSize) {
    sort_balls(0,0);
    *resultSize = 3;
    int** res = new int*[*resultSize];

    for (int i = 0; i < *resultSize; i++) {
        res[i] = new int[2];
        res[i][0] = 0;
        res[i][1] = 1;
    }

    return res;
}

void free_memory(int** obj) {
    if (obj != nullptr)
        delete[] obj;
}