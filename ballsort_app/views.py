from django.shortcuts import render
from django.http import HttpResponse

def ball_sort_start(request):
    return render(request, 'ballsort.html')