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
from .util import send_verification_email
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_text

from django.utils import timezone
from django.db.models.query_utils import Q
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


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
        username = None
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
                user.profile.email_confirmed = False
                user.save()

                messages.add_message(request, messages.SUCCESS, 'A email_verification email has been sent.')
                messages.add_message(request, messages.WARNING, 'Please also check your SPAM inbox!')
                auth_login(request, user)
                send_verification_email(request, user, "")

                return redirect(reverse('account:email_verification'))
            else:
                messages.error(request, "Please fix the errors below and resubmit!")
                return render(request, 'accounts/register.html', {'form':form} )
        
    



class log_out(View):
    @method_decorator(login_required)
    def get(self, request):
        logout(request)  # deletes all of the user session data before logging out
        messages.success(request, "Successfully signed out!")
        return redirect('/')



def activate(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
        messages.add_message(request, messages.WARNING, str(e))
        user = None
    
    if user and user.profile.temp_code == token:
        if user.profile.temp_code_valid < timezone.now():
            messages.add_message(request, messages.WARNING, 'account activation link has expired. Please request another one')
            return redirect(reverse('account:email_verification'))
        user.profile.email_confirmed = True  # and we're changing the boolean field so that the token link becomes invalid
        user.save()
        messages.add_message(request, messages.INFO, 'Hi {0}.'.format(request.user))
    else:
        messages.add_message(request, messages.WARNING, 'Account activation link is invalid.')
        redirect('/email_verification')
    return redirect('/dashboard')


class reset(View):
    def get(self, request):
        if request.user.is_authenticated:  # if user already logged in, redirect to the portal
            return redirect('/dashboard')
        form = ResetRequestForm()  
        context = {'form': form}
        return render(request, 'accounts/reset.html', context)

    def post(self, request):
        # ResetRequestForm checks if email is inside db
        password_reset_form = ResetRequestForm(request.POST)
        if password_reset_form.is_valid():
            data = password_reset_form.cleaned_data['email']
            user = User.objects.get(email=data)
            if user:
                send_verification_email(request,user, 'reset')
                messages.success(request, "A password reset link was sent to your mail")
            print(user.password)
        return render(request, 'accounts/reset.html', {'form':password_reset_form})


class resetpage(View):
    def get(self, request, uidb64, token):
        form = ResetFormPage()
        context = {'form':form}
        return render(request, 'accounts/resetpage.html', context)
    def post(self, request, uidb64, token):
        form = ResetFormPage(request.POST)
        if form.is_valid():
            try:
                uid = force_text(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
                print(user, token, user.profile.temp_code)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
                messages.add_message(request, messages.WARNING, str(e))
                user = None
            
            if user and user.profile.temp_code == token:
                if user.profile.temp_code_valid < timezone.now():
                    messages.add_message(request, messages.WARNING, 'Password reset link has expired. Please request another one')
                    return redirect(reverse('account:reset'))
                user.password = form.cleaned_data["password1"]
                user.save()
                messages.add_message(request, messages.INFO, 'Password has been reset. Please login again')
        else:
            messages.add_message(request, messages.WARNING, 'Account activation link is invalid.')

        return redirect(reverse('account:login'))


class email_verification(View):
    def get(self, request):
        '''A middleware is install to redirect all unverified user's action to this page until email is verifed'''
        return render(request, 'accounts/email_verification.html')
    
    def post(self, request):
        if user := request.user:
            verification_expire_time = user.profile.temp_code_valid
            if verification_expire_time > timezone.now():
                messages.add_message(request, messages.WARNING, f'You may send another verification email in {(verification_expire_time - timezone.now()).seconds} seconds')
            else:
                send_verification_email(request, user, type)
        else:
            messages.add_message(request, messages.WARNING, "unrecognized user. Please check your logging crednetial again")
            return redirect(reverse('account:login'))
        return render(request, 'accounts/email_verification.html')
