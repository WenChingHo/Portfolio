from django.contrib import messages
from django.contrib.auth import logout
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.urls import reverse
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin


class EmailVerificationMiddleware(MiddlewareMixin):
    """
    A custom middleware to always redirect logged in users to the email verification page if they have not
    verified their email yet. This middleware will redirect all site links to the main email verification
    page, until they verify their email.
    This middleware also process the email verification link to verify users and give them access to the
    site after successful verification.
    """
    def process_request(self, request):

        if request.path =='/dashboard/':
            # only check for email verification if user is logged in and not verified
            if request.user.is_authenticated and not request.user.is_superuser:
                if not request.user.profile.email_confirmed:
                    # Override event in which user wants to login before they verify their emai
                    messages.add_message(request, messages.WARNING, 'Please verifiy your email before accessing the dashboard!')
                    print(request.path)
                    return redirect(reverse('account:email_verification'))
        return None