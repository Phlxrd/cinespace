from django.urls import path
from . import views  # Views locais do app atual
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from .views import verificar_email
from .views import CustomPasswordResetView, CustomPasswordResetDoneView, CustomPasswordResetConfirmView, CustomPasswordResetCompleteView
from django.urls import path, include, reverse_lazy  # Importe reverse_lazy
from reproducao.views import salvar_progresso
from pesquisa.views import *
from spacemusic.views import *
from spacebot.views import *


urlpatterns = [
    path('', views.index, name='index'),  # Página inicial
    path('paginacadastro/', views.etapa1_cadastro, name='paginacadastro'),  # Cadastro (Etapa 1)
    path('verificar-email/', verificar_email, name='verificar_email'),
    path('etapa2_cadastro/', views.etapa2_cadastro, name='etapa2_cadastro'),  # Etapa 2: Escolher plano
    path('etapa3_cadastro/', views.etapa3_cadastro, name='etapa3_cadastro'),  # Etapa 3: Forma de pagamento
    path('paginalogin/', views.paginalogin, name='paginalogin'),  # Login
    path('cinetrailers/', views.cinetrailers, name='cinetrailers'),  # Página CineTrailers
    path('sobreacinetrailers/', views.sobrecinetrailers, name='sobreacinetrailers'),  # Sobre CineTrailers
    path('sobremim/', views.sobre_mim, name='sobremim'),  # Sobre o criador
    path('series/', views.series, name='series'),  # Séries
    path('favoritos/', views.favoritos, name='favoritos'),  # Séries
    path('lancamentos/', views.lancamentos, name='lancamentos'),  # Lançamentos
    path('entrar_contato/', views.entrar_contato, name='entrar_contato'),  # Contato
    path('filmes/', views.filmes, name='filmes'),  # Filmes
    path('doramas/', views.doramas, name='doramas'),  # Doramas
    path('esportes/', views.esportes, name='esportes'),  # esportes
    path('animes/', views.animes, name='animes'),  # Animes
    path('logout/', views.logout_view, name='logout'),  # Logout personalizado
    path('escolherusuario/', views.escolherusuario, name='escolherusuario'),  # Escolher usuário
    path('escolherplataforma/', views.escolherplataforma, name='escolherplataforma'),  # Escolher usuário
    path('registrar-dispositivo/', views.registrar_dispositivo, name='registrar_dispositivo'),
    path('remover-dispositivo/<int:dispositivo_id>/', views.remover_dispositivo, name='remover_dispositivo'),
    # Corrigindo as rotas para gerenciar perfis
    path('gerenciar_perfis/', views.gerenciar_perfis, name='gerenciar_perfis'),  # Rota para gerenciar perfis
    path('gerenciarperfil/', views.gerenciar_perfis, name='gerenciarperfil'),  # Outra rota para gerenciar perfis
    path('selecionar_perfil/<int:perfil_id>/', views.selecionar_perfil, name='selecionar_perfil'),
    path('adicionar_favorito/<int:perfil_id>/<int:conteudo_id>/',views.adicionar_favorito, name='adicionar_favorito'),


    # Usando as views do app 'reproducao'
    path('salvar-progresso/', salvar_progresso, name='salvar_progresso'),  # View do app 'reproducao'
    path('criar_perfil/', views.criar_perfil, name='criar_perfil'),
    path('gerenciar_perfis/', views.gerenciar_perfis, name='gerenciar_perfis'),
    path('api/perfil/<int:perfil_id>/',views.perfil_detail, name='perfil_detail'),





    

    # URLs carrosel
    path('cinetrailers/', views.carrossel_doramas, name='cinetrailers'),

    # URLs para redefinição de senha
    path('password_reset/', CustomPasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', CustomPasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', CustomPasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('verificar-email-reset/',views.verificar_email_reset, name='verificar_email_reset'),


    # URLs para as páginas de controle do usuário
    path('ajuda/', views.ajuda, name='ajuda'),
    path('assinaturas/', views.assinaturas, name='assinaturas'),
    path('configuracoes/', views.configuracoes, name='configuracoes'),
    path('conta/', views.conta, name='conta'),
    path('gerenciar-dispositivos/', views.gerenciar_dispositivos, name='gerenciar_dispositivos'),
    path("editar-nome-usuario/", views.editar_nome_usuario, name="editar_nome_usuario"),
    path("editar-senha/", views.editar_senha, name="editar_senha"),
    path('filmes/vingadores-ultimato/', views.vingadores_ultimato, name='vingadores-ultimato'),
    path('series/thelastofus/',views.the_last_of_us, name='thelastofus'),
    path('filmes/bad-boys-4/', views.bad_boys4, name='bad-boys-4'),
    path('painel-musica-admin/', painel_musica_admin, name='painel_musica_admin'),




]

# Adiciona a configuração para servir arquivos de mídia durante o desenvolvimento
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)