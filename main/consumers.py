import json
from channels.generic.websocket import AsyncWebsocketConsumer
from ballsort_app.models import solveSortBalls

# TODO: make modules private that don't need to be public
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
        solution = solveSortBalls(ball_list, max_size)

        # Convert back to json
        response = {"solution": [json.dumps({"from": pos[0], "to": pos[1]}) for pos in solution]}
        await self.send(text_data=json.dumps(response))