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

    int** EXPORT ball_solution(int**, int, int, int*);

    void EXPORT free_memory(int**, int);
}

#endif