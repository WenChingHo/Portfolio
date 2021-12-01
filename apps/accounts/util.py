import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.contrib import messages
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from decouple import config
from django.contrib.auth.tokens import default_token_generator    
from django.utils import timezone
from datetime import timedelta


def send_verification_email(request, user, type):
    token = default_token_generator.make_token(user)
    user.profile.temp_code = token
    user.profile.temp_code_valid = timezone.now() + timedelta(minutes=5)
    user.save()

    email_content = render_to_string('accounts/activation_email.html', {
        'user': user,
        'type':type,
        'protocol': config("PROTOCOL"),
        'domain': config("DOMAIN"),
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': token ,
    })
    # Sendgrid's API payload
    message = Mail(
        from_email='edward8888@ucla.edu',
        to_emails=user.email,
        subject='Sending with Twilio SendGrid is Fun',
        html_content=email_content)
    try:
        sg = SendGridAPIClient(config('SENDGRID_API_KEY'))
        response = sg.send(message)
    except Exception as e:
        print(e)
