from django.db import models
from main import settings
import ctypes
import os
import sys
import numpy as np

# Determine the correct library extension
# NOTE: testing is being done on a Linux system. Windows is currently non-functional due to incompatible cpp files when creating a dll
if sys.platform.startswith('win'):
    libname = "sortballs.dll"
elif sys.platform.startswith('darwin'):
    libname = "sortballs.dylib"
else:
    libname = "sortballs.so"

# Load the shared library
lib_path = os.path.join(settings.BASE_DIR, "main", libname)
solvelib = ctypes.CDLL(lib_path)

solvelib.ball_solution.argtypes = (ctypes.POINTER(ctypes.POINTER(ctypes.c_int)), ctypes.c_int, ctypes.c_int, ctypes.POINTER(ctypes.c_int))
solvelib.ball_solution.restype = ctypes.POINTER(ctypes.POINTER(ctypes.c_int))

solvelib.free_memory.argtypes = (ctypes.POINTER(ctypes.POINTER(ctypes.c_int)),ctypes.c_int)

def solveSortBalls(ball_list, max_size):
    num_capsules = len(ball_list)
    if num_capsules == 0:
        return []
    balls = np.array(ball_list, dtype=np.int32)
    res_size = ctypes.c_int()

    ball_pointers = (ctypes.POINTER(ctypes.c_int) * num_capsules)()
    for i in range(num_capsules):
        ball_pointers[i] = balls[i].ctypes.data_as(ctypes.POINTER(ctypes.c_int))

    print("pre-solution")
    result = solvelib.ball_solution(
        ball_pointers, 
        num_capsules, 
        max_size,
        ctypes.byref(res_size)
    )
    print("post-solution")

    result_memory = [[result[i][j] for j in range(2)] for i in range(res_size.value)]
    solvelib.free_memory(result, res_size)
    return result_memory