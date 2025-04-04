from django.shortcuts import render

def landing_page_start(request):
    return render(request, 'landing_page.html')