from django.contrib.auth import decorators
from django.shortcuts import redirect, render
from django.contrib import messages
from .forms import *
from django.urls import reverse
from django.contrib.auth import authenticate, logout
from django.contrib.auth import login as auth_login
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .util import send_verification_email
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_text

from django.utils import timezone
from datetime import timedelta
from django.db.models.query_utils import Q


# Create your views here.
class login(View):
    def get(self, request):
        if request.user.is_authenticated:  # if user already logged in, redirect to the portal
            return redirect('/dashboard')
        form = LoginForm()
        context = {'form':form}
        return render(request, 'accounts/login.html', context)

    def post(self, request):
        form = LoginForm(request.POST)
        context = {'form':form}
        if form.is_valid():
            email = form.cleaned_data['email']
            if User.objects.filter(email=email).exists():
                username = User.objects.get(email=request.POST["email"]).username
        else:
            messages.error(request, f"Email {request.POST['email']} not found. Sign up!")
            return render(request, 'accounts/login.html',context )
        print(form.cleaned_data['password'])
        user = authenticate(username=username, password=form.cleaned_data['password'])

        if user:
            # A backend authenticated the credentials and succeeded
            auth_login(request, user)
            messages.success(request, f"Welcome back, {user.username}")
            return redirect('/dashboard')
        else:
            # No backend authenticated the credentials
            messages.error(request, "invalid email or password. Try again!")
            return render(request, 'accounts/login.html', context)
 
class register(View):
    def get(self, request):
        form = RegisterForm()  
        context = {'form': form}
        return render(request, 'accounts/register.html', context )
    
    def post(self, request):
        form = RegisterForm(request.POST or None)  #Empty form or errored post form
        if request.POST:
            if form.is_valid():
                user = form.save()
                user.refresh_from_db()
                user.is_active = False
                user.save()

                token = PasswordResetTokenGenerator().make_token(user)
            
                user.profile.temp_code = token
                user.profile.temp_code_valid = timezone.now() + timedelta(minutes=10)
                send_verification_email(request,token,user,"")
                messages.add_message(request, messages.SUCCESS, 'A verification email has been sent.')
                messages.add_message(request, messages.WARNING, 'Please also check your SPAM inbox!')
                # Authenticate and log user in
                auth_login(request, user)   
                return redirect('verification')
            else:
                messages.error(request, "Please fix the errors below and resubmit!")
                return render(request, 'accounts/register.html', {'form':form} )
        
    



class log_out(View):
    @method_decorator(login_required)
    def get(self, request):
        logout(request)  # deletes all of the user session data before logging out
        messages.success(request, "Successfully signed out!")
        return redirect('/')

class reset(View):
    def get(self, request):
        if request.user.is_authenticated:  # if user already logged in, redirect to the portal
            return redirect('/dashboard')
        form = ResetRequestForm()  
        context = {'form': form}
        return render(request, 'accounts/reset.html', context)

    def post(self, request):
        password_reset_form = ResetRequestForm(request.POST)
        if password_reset_form.is_valid():
            data = password_reset_form.cleaned_data['email']
            user = User.objects.filter(Q(email=data))
            if user:
                user = user[0]
                token = PasswordResetTokenGenerator().make_token(user)
                user.profile.temp_code = token
                user.profile.temp_code_valid = timezone.now() + timedelta(minutes=10)
                send_verification_email(request,token,user, 'reset')
                messages.success(request, "A password reset link was sent to your mail")
        return render(request, 'accounts/reset.html', {'form':password_reset_form})



def activate(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
        messages.add_message(request, messages.WARNING, str(e))
        user = None
    
    if user and user.profile.temp_code == token:
        if user.profile.temp_code_valid < timezone.now():
            messages.add_message(request, messages.WARNING, 'ccount activation link has expired. Please request another one')
            return reverse('verification')
        user.is_active = True  # now we're activating the user
        user.profile.email_confirmed = True  # and we're changing the boolean field so that the token link becomes invalid
        user.save()
        auth_login(request, user)  # log the user in
        messages.add_message(request, messages.INFO, 'Hi {0}.'.format(request.user))
    else:
        messages.add_message(request, messages.WARNING, 'Account activation link is invalid.')

    return redirect('/dashboard')


class resetpage(View):
    def get(self, request, uidb64, token):
        form = ResetFormPage()
        context = {'form':form}
        return render(request, 'accounts/resetpage.html', context)



class verification(View):
    def get(self, request):
        return render(request, 'accounts/verification.html')