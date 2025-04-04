import json
from channels.generic.websocket import AsyncWebsocketConsumer
from ballsort_app.models import solveSortBalls

# class to communicate with the client
class MyWebSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)

        balls = data["balls"]
        maxSize = data["maxSize"]

        ballList = [[json.loads(b)["ball"] for b in json.loads(c)["balls"]] for c in balls]

        # Call C++ function
        solution = solveSortBalls(ballList, maxSize)

        response = {"solution": [json.dumps({"from": pos[0], "to": pos[1]}) for pos in solution]}
        await self.send(text_data=json.dumps(response))