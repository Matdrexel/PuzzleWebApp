#ifndef SOLVE_H
#define SOLVE_H

// NOTE: these modules do not yet work on Windows due to incompatability of cpp files with dll libraries
#ifdef _WIN32
    #define EXPORT __declspec(dllexport)
#else
    #define EXPORT
#endif


// NOTE: extern "C" is all functions Python can "see"
extern "C" {

    int** EXPORT ball_solution(int**, int, int, int*);

    void EXPORT free_memory(int**, int);
}

#endif