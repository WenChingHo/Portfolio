from django.shortcuts import render
from .forms import *

# Create your views here.
def index(request):
    contact_me_form = ContactMeForm()
    return render(request, 'main/index.html', {'contact_me_form': contact_me_form})

def login(request):
    return render(request, 'main/login.html')

def register(request):
    return render(request, 'main/register.html')