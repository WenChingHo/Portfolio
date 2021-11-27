from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from django import forms

# Create your forms here.
class ContactMeForm(forms.Form):
    email = forms.EmailField(widget=forms.TextInput(attrs={'size':30}))
    name = forms.CharField(widget=forms.TextInput(attrs={'size':30}))
    message = forms.CharField(widget=forms.Textarea(attrs={'rows':10, 'cols':25}))
