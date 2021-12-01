from django.urls import path

from . import views

app_name = "todoist"
urlpatterns = [
    path('', views.index, name='index'),
    path('api/<todoistApi>/<month>/<year>/', views.API.as_view(), name='api'),
]