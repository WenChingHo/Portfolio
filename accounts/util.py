import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.contrib import messages
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from decouple import config


def send_verification_email(request, token, user, type):

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
