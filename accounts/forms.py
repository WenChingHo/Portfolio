from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from django import forms

# Create your forms here.
def custom_password_help_text_html():
    return format_html("""
    <ul>
        <li> Contains at least 8 characters </li>
        <li> Contains at least 1 lowercase(s) </li>
        <li> Contains at least 1 uppercase(s) </li>
        <li> Contains at least 1 digit(s) </li>
        <li> Contains at least 1 letter(s) </li>
        <li> Contains at least 1 special characters(s) </li>
    </ul>""")
class ResetForm(forms.Form):
    email = forms.EmailField()

class LoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password', 'class': 'form-control'})
    )

class RegisterForm(UserCreationForm):
    email = forms.EmailField(max_length=254, help_text='Required. Please inform a valid email address.', required=True, widget=forms.EmailInput(attrs={'class': 'form-control'}))
    password1 = forms.CharField(
        label="Password",
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password', 'class': 'form-control'}),
        help_text=custom_password_help_text_html(),
    )
    password2 = forms.CharField(
        label="Password confirmation",
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password', 'class': 'form-control'}),
        strip=False,
        help_text="Enter the same password as before, for verification.",
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
        }

    def clean_email(self):
        """
        Override clean_email to ensure emails saved in the User model are unique.
        """
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise ValidationError("Email already exists.")
        return email






