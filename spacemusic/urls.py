from django.urls import path
from . import views

urlpatterns = [
    path('space_music/', views.space_music, name='space_music'),
    path('pesquisa/', views.pesquisa_music, name='pesquisa_music'),
    path('inserir-musica/', views.inserir_musica, name='inserir_musica'),
]