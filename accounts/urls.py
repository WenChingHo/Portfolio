from django.urls import path

from . import views

urlpatterns = [
     path('login/', views.login.as_view(), name='login'),
     path('logout/', views.log_out.as_view(), name='log_out'),
     path('register/', views.register.as_view(), name='register'),
     path('reset/', views.reset.as_view(), name='reset'),
     path('activate/<uidb64>/<token>/', views.activate, name='activate'),
     path('resetpage/<uidb64>/<token>/', views.resetpage.as_view(), name='resetpage'),
     path('email_verification/', views.email_verification.as_view(), name='email_verification'),
]