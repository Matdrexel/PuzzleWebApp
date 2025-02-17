import json
import ctypes
import os
import sys
import numpy as np
from channels.generic.websocket import AsyncWebsocketConsumer

# Determine the correct library extension
if sys.platform.startswith('win'):
    libname = "sortballs.dll"
elif sys.platform.startswith('darwin'):
    libname = "sortballs.dylib"
else:
    libname = "sortballs.so"

# Load the shared library
lib_path = os.path.join(os.path.dirname(__file__), libname)
solvelib = ctypes.CDLL(lib_path)

solvelib.ball_solution.argtypes = (ctypes.POINTER(ctypes.POINTER(ctypes.c_int)), ctypes.c_int, ctypes.c_int, ctypes.POINTER(ctypes.c_int))
solvelib.ball_solution.restype = ctypes.POINTER(ctypes.POINTER(ctypes.c_int))

solvelib.free_memory.argtypes = (ctypes.POINTER(ctypes.POINTER(ctypes.c_int)),)

# TODO
class MyWebSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)

        balls = data["balls"]  # List of balls
        max_size = data["max_size"]

        # Convert list of dicts into list of tuples for C++ function
        ball_list = [[json.loads(b)["ball"] for b in json.loads(c)["balls"]] for c in balls]

        # Call C++ function
        solution = self.sortBalls(ball_list, max_size)

        # Convert back to json
        response = {"solution": [json.dumps({"from": pos[0], "to": pos[1]}) for pos in solution]}
        await self.send(text_data=json.dumps(response))


    def sortBalls(self, ball_list, max_size):
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
        solvelib.free_memory(result)
        return result_memory