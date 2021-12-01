from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db.models.signals import post_save

# Create your models here.
class Profile(models.Model):
    login_type = []
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_active = models.BooleanField(verbose_name='Active?', default=True)
    temp_code = models.CharField(max_length=70, verbose_name='Temporary Code', blank=True, null=True)
    temp_code_valid = models.DateTimeField(verbose_name='Temporary Code Valid Till', blank=True, null=True)
    email_confirmed = models.BooleanField(verbose_name='Email Verified?', default=True)

    def __str__(self):
        return self.user.email


# as soon as one User auth object is created, create an associated profile object
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


# whenever User.save() happens, Profile.save() also happens
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
