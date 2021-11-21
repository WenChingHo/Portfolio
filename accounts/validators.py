import re
from django.core.exceptions import ValidationError


from django.core.exceptions import ValidationError
from django.utils.translation import ugettext

class CustomPasswordValidator():

    def __init__(self, min_length=8):
        self.min_length = min_length

    def validate(self, password, user=None):
        special_characters = "[~\!@#\$%\^&\*\(\)ugettext\+{}\":;'\[\]]"
        error_message = {
            'lower':'Password must contain at least 1 lowercase(s)',
            'upper':'Password must contain at least 1 uppercase(s)',
            'digit':'Password must contain at least 1 digit(s)',
            'alpha':'Password must contain at least 1 letter(s)',
            'special':'Password must contain at least 1 special character(s)'
        }
        # Check all the requirements  
        errors = []
        if not any(char.islower() for char in password):
            errors.append(error_message['lower'])
        if not any(char.isupper() for char in password):
            errors.append(error_message['upper'])
        if not any(char.isdigit() for char in password):
            errors.append(error_message['digit'])
        if not any(char.isalpha() for char in password):
            errors.append(error_message['alpha'])
        if not any(char in special_characters for char in password):
            errors.append(error_message['special'])
        
        if errors:
            raise ValidationError(errors)
        

    def get_help_text(self):
        return ""