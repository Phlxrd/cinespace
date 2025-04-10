from django.urls import path
from . import views
from django.contrib.auth import views as auth_views


urlpatterns = [
path('salvar-progresso/', views.salvar_progresso, name='salvar_progresso'),
]