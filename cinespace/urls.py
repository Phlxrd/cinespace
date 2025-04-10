from django.contrib import admin
from django.urls import path, include
from spacemusic.views import *
from spacebot.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('contas.urls')),  # URLs do app contas
    path('pesquisa/', include('pesquisa.urls')),  # URLs do app pesquisa
    path('reproducao/', include('reproducao.urls')),  # URLs do app reproducao
    path('space_music/', include('spacemusic.urls')),  # URLs do app spacemusic
    path('spacebot/', include('spacebot.urls')),  # URLs do app spacebot

    # URLs específicas para views
    path('inserir-musica/', inserir_musica, name='inserir_musica'),
    path('search-music/', search_music, name='search_music'),
    path('processar-comando/', processar_comando, name='processar_comando'),
    path('processar-audio/', processar_audio, name='processar_audio'),
    path('criar-chat/', criar_chat, name='criar_chat'),
    path('listar-chats/', listar_chats, name='listar_chats'),
    path('enviar-mensagem/<int:chat_id>/', enviar_mensagem, name='enviar_mensagem'),
    path('carregar-mensagens/<int:chat_id>/', carregar_mensagens, name='carregar_mensagens'),
    path('atualizar-nome-chat/<int:chat_id>/', atualizar_nome_chat, name='atualizar_nome_chat'),
    path('pesquisa_music/', pesquisa_music, name='pesquisa_music'),  # Corrigido: adicionado barra no final
    path('space_music/', space_music, name='space_music'),
    path('painel-musica-admin/', painel_musica_admin, name='painel_musica_admin'),
    path('spacemusic_album/',spacemusic_album, name='spacemusic_album'),
    path('spacemusic_artistas/',spacemusic_artistas, name='spacemusic_artistas'),
    path('buscar-musicas/', buscar_musicas, name='buscar_musicas'),
    path('buscar-albuns/', buscar_albuns, name='buscar_albuns'),
    path('buscar-artistas/', buscar_artistas, name='buscar_artistas'),
    path('buscar-recomendacoes/', buscar_recomendacoes, name='buscar_recomendacoes'),
    path('buscar-albuns-customizados/',buscar_albuns_customizados, name='buscar_albuns_customizados'), #nova url
]

if settings.DEBUG or settings.ENVIRONMENT == "production":
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)