# scabello/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('spacebot/', views.spacebot, name='spacebot'),
    path('processar-comando/', views.processar_comando, name='processar_comando'),
    path('processar-audio/', views.processar_audio, name='processar_audio'),
    path('criar-chat/', views.criar_chat, name='criar_chat'),
    path('listar-chats/', views.listar_chats, name='listar_chats'),
    path('enviar-mensagem/<int:chat_id>/', views.enviar_mensagem, name='enviar_mensagem'),
    path('carregar-mensagens/<int:chat_id>/', views.carregar_mensagens, name='carregar_mensagens'),
    path('atualizar-nome-chat/<int:chat_id>/', views.atualizar_nome_chat, name='atualizar_nome_chat'),
]
