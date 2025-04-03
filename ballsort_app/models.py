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
libPath = os.path.join(settings.BASE_DIR, "main", libname)
solvelib = ctypes.CDLL(libPath)

solvelib.ballSolution.argtypes = (ctypes.POINTER(ctypes.POINTER(ctypes.c_int)), ctypes.c_int, ctypes.c_int, ctypes.POINTER(ctypes.c_int))
solvelib.ballSolution.restype = ctypes.POINTER(ctypes.POINTER(ctypes.c_int))

solvelib.freeMemory.argtypes = (ctypes.POINTER(ctypes.POINTER(ctypes.c_int)),ctypes.c_int)

def solveSortBalls(ballList, maxSize):
    numCapsules = len(ballList)
    if numCapsules == 0:
        return []
    balls = np.array(ballList, dtype=np.int32)
    resSize = ctypes.c_int()

    ballPointers = (ctypes.POINTER(ctypes.c_int) * numCapsules)()
    for i in range(numCapsules):
        ballPointers[i] = balls[i].ctypes.data_as(ctypes.POINTER(ctypes.c_int))

    print("pre-solution")
    result = solvelib.ballSolution(
        ballPointers, 
        numCapsules, 
        maxSize,
        ctypes.byref(resSize)
    )
    print("post-solution")

    resultMemory = [[result[i][j] for j in range(2)] for i in range(resSize.value)]
    solvelib.freeMemory(result, resSize)
    return resultMemory