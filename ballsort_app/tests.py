from django.test import TestCase
import time
from ballsort_app.models import solveSortBalls

# Create your tests here.
class TestBallSort(TestCase):    
    def _testCase(self, ballList, name):
        print("\nTesting", name, "(" + str(len(ballList)) + "," + str(len(ballList[0])) + ")")

        # time solution
        maxSize = len(ballList[0])
        start = time.time()
        solution = solveSortBalls(ballList, len(ballList[0]))
        end = time.time()
        
        # check that solution is valid
        for capsule in ballList:
            while len(capsule) > 0 and capsule[-1] == -1:
                capsule.pop()
        
        try:
            for move in solution:
                ball = ballList[move[0]].pop()
                ballList[move[1]].append(ball)
                self.assertTrue(len(ballList[move[1]]) <= maxSize)
        except:
            self.fail(name, "did not produce a valid solution")
        
        # check that solution leads to a winning position
        for capsule in ballList:
            self.assertTrue(len(capsule) == 0 or len(capsule) == maxSize)
            if len(capsule) > 0:
                first = capsule[0]
                for i in range(1, maxSize):
                    self.assertEquals(capsule[i], first)
        
        print(name, "took", end - start, "seconds.")


    def testSuperSimpleCase(self):
        self._testCase([[0,1],[0,1],[-1,-1]], "Super Simple Test Case")
    
    def testSimpleCase(self):
        self._testCase([[0,0,1], [1,2,1], [2,2,0], [-1,-1,-1], [-1,-1,-1]], "Simple Test Case")
    
    def test4Case(self):
        self._testCase([[0,1,2,3],[4,5,1,1],[6,2,3,7],[2,1,3,4],[8,9,4,4],[6,0,5,9],[2,6,7,9],[0,0,6,8],[5,7,5,8],[3,7,9,8],[-1,-1,-1,-1],[-1,-1,-1,-1]], "Regular Max Size 4 Case")

    def test5Case(self):
        self._testCase([[0,0,1,2,1],[3,3,4,5,6],[7,8,1,6,1],[4,9,2,8,9],[5,9,0,6,3],[6,2,4,0,1],[7,4,6,8,8],[9,7,5,2,4],[9,7,3,3,5],[0,2,8,7,5],[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1]], "Simple Size 5 Case")
    
    def testHardCase(self):
        self._testCase([[0,1,2,2,3],[1,4,5,2,2],[5,4,0,1,6],[7,3,0,8,6],[7,9,9,3,4],[0,5,7,8,6],[7,3,8,3,0],[6,4,1,8,9],[9,9,6,5,7],[2,5,8,1,4],[-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1]], "Max Size 5 Hard Case")
