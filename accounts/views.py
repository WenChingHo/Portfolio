from django.shortcuts import redirect, render
from django.contrib import messages
from .forms import *
from django.urls import reverse
from django.contrib.auth import authenticate,  logout
from django.contrib.auth import login as auth_login
from django.contrib.auth.decorators import login_required


# Create your views here.
def login(request):
    if request.POST:
        if User.objects.filter(email=request.POST["email"]).exists():
            username = User.objects.get(email=request.POST["email"]).username
        else:
            messages.error(request, f"Email {request.POST['email']} not found. Sign up!")
            return redirect(reverse('login'))

        user = authenticate(username=username, password=request.POST["password"])

        if user is not None:
            # A backend authenticated the credentials and succeeded
            auth_login(request, user)
            messages.success(request, f"Welcome back, {user.first_name}")
            return redirect('/dashboard')
        else:
            # No backend authenticated the credentials
            messages.error(request, "invalid email or password. Try again!")
    else:
        if request.user.is_authenticated:  # if user already logged in, redirect to the portal
            return redirect('/dashboard')

    return render(request, 'accounts/login.html')


def register(request):
    form = RegisterForm(request.POST or None)  #Empty form or errored post form
    if request.POST:
        if form.is_valid():
            user = form.save()
            user.refresh_from_db()

            user.save()
            # Authenticate and log user in

            auth_login(request, user)
            return redirect('login')
        else:
            messages.error(request, "Please fix the errors below and resubmit!")
        
    context = {'form': form}
    return render(request, 'accounts/register.html', context )


@login_required
def log_out(request):
    logout(request)  # deletes all of the user session data before logging out
    messages.success(request, "Successfully signed out!")
    return redirect('/')
