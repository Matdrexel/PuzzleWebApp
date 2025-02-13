from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def ball_sort_start(request):
    return render(request, 'ballsort.html')