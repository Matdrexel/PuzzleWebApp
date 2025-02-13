from django.urls import path
from . import views

urlpatterns = [
    path('', views.ball_sort_start, name='ball_sort'),
]