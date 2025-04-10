from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login as auth_login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.views import (
    PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView
)
from .UsuarioForm import UsuarioForm  # Assumes you have a form for user creation/editing
from .models import Usuario, Perfil, Conteudo, ContinueAssistindo, Favorito, HistoricoVisualizacao, Assinatura
import logging
from django.views.decorators.csrf import csrf_exempt
import json
from django.urls import reverse, reverse_lazy
from django.utils import timezone
from django.contrib.auth.hashers import check_password, make_password  # check hash
from cryptography.fernet import Fernet
from django.conf import settings
from django.core.mail import send_mail
from pesquisa.models import Midia
from datetime import datetime  # Import correto para usar datetime.strptime()
from django.shortcuts import render, redirect
from django.contrib import messages
from django.urls import reverse
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from .models import Usuario, Assinatura
from datetime import datetime as dt
from django.contrib.gis.geoip2 import GeoIP2
from django.contrib.auth import login as auth_login
from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Dispositivo, Usuario
import platform  
from django.http import HttpResponse
from django.contrib.auth import get_user_model


# Configuração de logger
logger = logging.getLogger(__name__)

# ---------- Funções Públicas ----------

def index(request):
    if request.user.is_authenticated:
        return render(request, 'cinetrailers.html')  # Página para usuários autenticados
    else:
        return render(request, 'index.html')  # Página de boas-vindas para não autenticados

# Páginas públicas
def sobrecinetrailers(request):
    return render(request, 'sobrecinetrailers.html')

def sobre_mim(request):
    return render(request, 'sobremim.html')

def entrar_contato(request):
    return render(request, 'entrar_contato.html')

# Logout

def logout_view(request):
    if 'perfil_id' in request.session:
        del request.session['perfil_id']
    logout(request)
    messages.success(request, 'Você foi desconectado com sucesso.')
    return redirect('index')


# ---------- Funções de Cadastro ----------

# Etapa 1 do cadastro
def etapa1_cadastro(request):
    if request.method == 'POST':
        formulario = UsuarioForm(request.POST)
        if formulario.is_valid():
            # Dados validados, prossiga para a próxima etapa
            request.session['nome_usuario'] = formulario.cleaned_data['nome_usuario']
            request.session['email'] = formulario.cleaned_data['email']
            request.session['password1'] = formulario.cleaned_data['password1']
            return redirect('etapa2_cadastro')
        else:
            # Exiba mensagens de erro específicas
            for field, errors in formulario.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}", extra_tags='cadastro')
            return render(request, 'paginacadastro.html', {'formulario': formulario})
    else:
        formulario = UsuarioForm()
    return render(request, 'paginacadastro.html', {'formulario': formulario})

@csrf_exempt
def verificar_email(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email', '').strip()

            if not email:
                return JsonResponse({'valid': False, 'message': 'O campo de email não pode estar vazio.'}, status=400)

            if Usuario.objects.filter(email=email).exists():
                return JsonResponse({'valid': False, 'message': 'Esse email já está em uso.'})
            else:
                return JsonResponse({'valid': True})
        except Exception as e:
            return JsonResponse({'valid': False, 'message': 'Erro ao processar a requisição.'}, status=500)
    return JsonResponse({'valid': False, 'message': 'Método não permitido.'}, status=405)

# Etapa 2 do cadastro
def etapa2_cadastro(request):
    # Recupera os dados da sessão
    nome_usuario = request.session.get('nome_usuario')
    email = request.session.get('email')
    password1 = request.session.get('password1')

    if not all([nome_usuario, email, password1]):
        return redirect('paginacadastro')

    if request.method == 'POST':
        plano = request.POST.get('plano')
        tipo_plano = request.POST.get('tipo_plano', 'mensal')  # Padrão é mensal

        if plano in ['lunar', 'supernova', 'multiverso']:
            # Passa todos os dados para a Etapa 3
            dados = {
                'nome_usuario': nome_usuario,
                'email': email,
                'password1': password1,
                'plano': plano,
                'tipo_plano': tipo_plano,
            }
            # Salva os dados na sessão
            request.session['dados_etapa2'] = dados
            return redirect('etapa3_cadastro')
        else:
            messages.error(request, 'Plano Incorreto. Escolha entre Lunar, Supernova ou Multiverso.', extra_tags='cadastro')

    return render(request, 'etapa2_cadastro.html', {
        'nome_usuario': nome_usuario,
        'email': email,
        'password1': password1,
    })

# Etapa 3 do cadastro
def etapa3_cadastro(request):
    if request.method == 'POST':
        try:
            # Recupera os dados da sessão
            dados_etapa2 = request.session.get('dados_etapa2')
            if dados_etapa2 is None:
                return redirect('etapa2_cadastro')

            dados = request.POST
            tipo_pagamento = dados.get('tipo_pagamento', '').strip()
            numero_cartao = dados.get('numero_cartao', '').strip()
            nome_cartao = dados.get('nome_cartao', '').strip()
            validade = dados.get('validade', '').strip()
            cvv = dados.get('cvv', '').strip()

            if not tipo_pagamento:
                messages.error(request, 'Por favor, selecione o tipo de pagamento.', extra_tags='cadastro')
                return render(request, 'etapa3_cadastro.html', {'dados': dados_etapa2})

            if tipo_pagamento in ['credito', 'debito']:
                if not all([numero_cartao, nome_cartao, validade, cvv]):
                    messages.error(request, 'Por favor, preencha todos os campos de pagamento.', extra_tags='cadastro')
                    return render(request, 'etapa3_cadastro.html', {'dados': dados_etapa2})

            # Cria o usuário
            usuario = Usuario(
                email=dados_etapa2['email'],
                nome_usuario=dados_etapa2['nome_usuario'],
                plano=dados_etapa2['plano'],
            )
            usuario.set_password(dados_etapa2['password1'])
            usuario.save()

            # Cria a assinatura
            assinatura = Assinatura(
                usuario=usuario,
                plano=dados_etapa2['plano'],
                tipo_pagamento=tipo_pagamento,
                tipo_plano=dados_etapa2['tipo_plano'],  # Adiciona o tipo de plano (mensal/anual)
            )

            if tipo_pagamento in ['credito', 'debito']:
                # Hash dos dados do cartão
                assinatura.numero_cartao_criptografado = make_password(numero_cartao)
                assinatura.nome_cartao_criptografado = make_password(nome_cartao)
                assinatura.validade_criptografada = make_password(validade)
                assinatura.cvv_criptografado = make_password(cvv)
                # Calcula a próxima cobrança (30 dias a partir de hoje)
                assinatura.proxima_cobranca = timezone.now().date() + timezone.timedelta(days=30)

            assinatura.save()

            # Limpa os dados da sessão
            del request.session['dados_etapa2']
            messages.success(request, 'Cadastro concluído com sucesso! Faça login para começar.', extra_tags='login')
            return redirect(reverse('paginalogin'))

        except Exception as e:
            messages.error(request, f"Ocorreu um erro durante o cadastro: {str(e)}", extra_tags='cadastro')
            return render(request, 'etapa3_cadastro.html', {'dados': dados_etapa2})

    return render(request, 'etapa3_cadastro.html', {'dados': request.session.get('dados_etapa2')})

# ---------- Funções de Login ----------

def obter_ip(request):
    """ Obtém o endereço IP do usuário """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def obter_pais(ip):
    """ Obtém o país do IP usando GeoIP2 """
    try:
        geo = GeoIP2()
        return geo.country_name(ip)
    except:
        return "Desconhecido"


def paginalogin(request):
    if request.user.is_authenticated:
        return redirect('escolherusuario')

    if request.method == 'POST':
        email = request.POST.get('email')
        senha = request.POST.get('senha')

        try:
            usuario = Usuario.objects.get(email=email)
            if usuario.check_password(senha):
                auth_login(request, usuario, backend='contas.backends.PersonalizadoBackend')

                # Capturar informações do dispositivo
                ip = obter_ip(request)
                sistema_operacional = platform.system()  # Captura Windows, Linux, macOS, etc.
                pais = obter_pais(ip)

                # Registrar ou atualizar o dispositivo
                dispositivo, created = Dispositivo.objects.get_or_create(
                    usuario=usuario,
                    sistema_operacional=sistema_operacional,
                    defaults={'ip': ip, 'pais': pais}
                )
                if not created:
                    dispositivo.ip = ip
                    dispositivo.pais = pais
                    dispositivo.save()

                return redirect('escolherusuario')

            else:
                messages.error(request, 'Email ou Senha está incorreto. Tente novamente.', extra_tags='login')

        except Usuario.DoesNotExist:
            messages.error(request, 'Email ou senha está incorreto, Tente novamente', extra_tags='login')

    # Adiciona a variável de contexto para identificar a página de login
    context = {'is_login_page': True}
    return render(request, 'paginalogin.html', context)



# ---------- Funções de Perfis ----------
# Escolher usuário
from .models import Perfil, Assinatura
@login_required(login_url='paginalogin')
def escolherusuario(request):
    usuario = request.user
    perfis = Perfil.objects.filter(usuario=usuario)
    plano = None  # Valor padrão para o caso de não existir assinatura
    limite_perfis = 0  # Valor padrão para o caso de não existir assinatura

    try:
        assinatura = Assinatura.objects.get(usuario=usuario)
        plano = assinatura.plano
        limite_perfis = {
            'lunar': 3,
            'supernova': 4,
            'multiverso': 6,
        }.get(plano, 0)  # Pega o limite com base no plano ou usa 0 se não reconhecer

    except Assinatura.DoesNotExist:
        messages.info(request, 'Você não tem assinatura, considere comprar um plano para continuar.')
        plano = None
        limite_perfis = 0

    context = {
        'perfis': perfis,
        'limite_perfis': limite_perfis,
        'plano': plano,  # Garante que plano esteja sempre no contexto
    }
    return render(request, 'usuario/escolherusuario.html', context)


logger = logging.getLogger(__name__)
import datetime

def is_valid_date(year, month, day):
    """Valida a data, considerando anos bissextos e meses com dias diferentes."""
    try:
        datetime.date(year, month, day)
        return True
    except ValueError:
        return False
    
@csrf_exempt
@login_required
def criar_perfil(request):
    if request.method == 'POST':
        try:
            # --- VERIFICAÇÃO DO LIMITE DE PERFIS (MANTENHA ISSO AQUI) ---
            usuario = request.user
            try:
                assinatura = Assinatura.objects.get(usuario=usuario)
                plano = assinatura.plano
                limite_perfis = {
                    'lunar': 3,
                    'supernova': 4,
                    'multiverso': 6,
                }.get(plano, 0)
            except Assinatura.DoesNotExist:
                limite_perfis = 0  # Ou outro valor padrão, se preferir

            perfis_existentes = Perfil.objects.filter(usuario=usuario).count()
            if perfis_existentes >= limite_perfis:
                return JsonResponse({'success': False, 'message': 'Você atingiu o limite de perfis para o seu plano.'}, status=403)  # 403 Forbidden
            # --- FIM DA VERIFICAÇÃO ---

            nome_usuario = request.POST.get('nome_usuario')
            data_nascimento_str = request.POST.get('data_nascimento')
            perfil_infantil = request.POST.get('perfil_infantil') == 'on'
            imagem_nome = request.POST.get('imagem_selecionada')

            if not nome_usuario or not imagem_nome:
                return JsonResponse({'success': False, 'message': 'Dados incompletos'}, status=400)

            data_nascimento = None
            if not perfil_infantil:
                # ... (validação da data - você já tem isso) ...
                if not data_nascimento_str:
                    return JsonResponse({'success': False, 'message': 'Data de nascimento é obrigatória para perfis não infantis'}, status=400)
                try:
                    year, month, day = map(int, data_nascimento_str.split('-'))
                    if not is_valid_date(year, month, day):
                        raise ValueError('Data inválida')
                    data_nascimento = datetime.date(year, month, day)
                except ValueError:
                    return JsonResponse({'success': False, 'message': 'Formato de data inválido ou data inválida.'}, status=400)

            imagem_caminho = f'imagens_perfis/{imagem_nome}.jpg'

            perfil = Perfil(
                usuario=request.user,
                nome_usuario=nome_usuario,
                data_nascimento=data_nascimento,
                perfil_infantil=perfil_infantil,
                imagem=imagem_caminho
            )
            perfil.save()

            return JsonResponse({'success': True, 'message': 'Perfil criado com sucesso!'})

        except Exception as e:
            logger.error(f"Erro ao criar perfil: {str(e)}")
            return JsonResponse({'success': False, 'message': 'Erro interno no servidor'}, status=500)

    return JsonResponse({'success': False, 'message': 'Método não permitido'}, status=405)

@login_required(login_url='paginalogin')
def gerenciar_perfis(request):
    perfis = Perfil.objects.filter(usuario=request.user)

    if request.method == 'POST':
        if 'edit_profile_id' in request.POST:  # Edição de perfil
            perfil_id = request.POST['edit_profile_id']
            nome_usuario = request.POST.get('nome_usuario', '').strip()
            imagem = request.POST.get('imagem')
            perfil_infantil = request.POST.get('perfil_infantil', 'off') == 'on'
            
            try:
                perfil = Perfil.objects.get(id=perfil_id, usuario=request.user)
                
                # Atualiza os campos básicos
                perfil.nome_usuario = nome_usuario
                perfil.perfil_infantil = perfil_infantil
                
                # Lógica para data de nascimento
                if perfil_infantil:
                    perfil.data_nascimento = None
                else:
                    data_nascimento = request.POST.get('data_nascimento')
                    if data_nascimento:
                        try:
                            perfil.data_nascimento = dt.strptime(data_nascimento, '%Y-%m-%d').date()
                        except ValueError:
                            return JsonResponse({
                                'status': 'error',
                                'message': 'Formato de data inválido. Use YYYY-MM-DD.'
                            }, status=400)

                # Atualiza a imagem se foi alterada
                if imagem:
                    # Remove o caminho completo se já existir
                    if 'imagens_perfis/' in imagem:
                        perfil.imagem = imagem
                    else:
                        perfil.imagem = f"imagens_perfis/{imagem}.jpg"

                perfil.save()

                return JsonResponse({
                    'status': 'success',
                    'message': 'Perfil atualizado com sucesso!',
                    'nome_usuario': perfil.nome_usuario,
                    'imagem': perfil.imagem.url if perfil.imagem else '',
                    'perfil_infantil': perfil.perfil_infantil,
                    'data_nascimento': perfil.data_nascimento.strftime('%Y-%m-%d') if perfil.data_nascimento else None
                })
                
            except Perfil.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Perfil não encontrado.'
                }, status=404)
                
            except Exception as e:
                return JsonResponse({
                    'status': 'error',
                    'message': str(e)
                }, status=500)

        elif 'excluir' in request.POST:  # Exclusão de perfil
            perfil_id = request.POST.get('perfil_id')
            try:
                perfil = Perfil.objects.get(id=perfil_id, usuario=request.user)
                perfil.delete()
                return JsonResponse({
                    'status': 'success',
                    'message': 'Perfil excluído com sucesso!'
                })
            except Perfil.DoesNotExist:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Perfil não encontrado.'
                }, status=404)
            except Exception as e:
                return JsonResponse({
                    'status': 'error',
                    'message': str(e)
                }, status=500)

    return render(request, 'usuario/gerenciar_perfis.html', {
        'perfis': perfis
    })

@login_required(login_url='paginalogin')
def selecionar_perfil(request, perfil_id):
    try:
        perfil = Perfil.objects.get(id=perfil_id, usuario=request.user)
        request.session['perfil_id'] = perfil.id
        request.session['perfil_nome'] = perfil.nome_usuario  # ADICIONE ESTA LINHA
        messages.success(request, f'Perfil {perfil.nome_usuario} selecionado com sucesso!')
        return redirect('escolherplataforma')
    except Perfil.DoesNotExist:
        messages.error(request, 'Perfil não encontrado.')
        return redirect('escolherusuario')
    

from django.http import JsonResponse
from .models import Perfil

def perfil_detail(request, perfil_id):
    try:
        perfil = Perfil.objects.get(id=perfil_id)
        data = {
            'nome_usuario': perfil.nome_usuario,
            'plano': perfil.usuario.assinatura.plano,  # Assumindo que o plano está na assinatura do usuário
        }
        return JsonResponse(data)
    except Perfil.DoesNotExist:
        return JsonResponse({'error': 'Perfil não encontrado'}, status=404)




def adicionar_continue_assistindo(request, perfil_id, conteudo_id):
    perfil = get_object_or_404(Perfil, id=perfil_id)
    conteudo = get_object_or_404(Conteudo, id=conteudo_id)
    tempo_assistido = request.POST.get('tempo_assistido', 0)

    # Cria ou atualiza o registro de "Continue Assistindo"
    continue_assistindo, created = ContinueAssistindo.objects.update_or_create(
        perfil=perfil,
        conteudo=conteudo,
        defaults={'tempo_assistido': tempo_assistido}
    )

    return JsonResponse({'status': 'success', 'message': 'Continue Assistindo atualizado.'})


@login_required
def adicionar_favorito(request, conteudo_id):
    # Obtém o perfil ativo da sessão
    perfil_id = request.session.get('perfil_id')
    if not perfil_id:
        return JsonResponse({'status': 'error', 'message': 'Nenhum perfil selecionado.'}, status=400)

    perfil = get_object_or_404(Perfil, id=perfil_id, usuario=request.user)
    conteudo = get_object_or_404(Conteudo, id=conteudo_id)

    # Verifica se já é favorito
    if Favorito.objects.filter(perfil=perfil, conteudo=conteudo).exists():
        return JsonResponse({'status': 'error', 'message': 'Este conteúdo já está nos favoritos.'}, status=400)

    # Adiciona aos favoritos
    Favorito.objects.create(perfil=perfil, conteudo=conteudo)
    return JsonResponse({'status': 'success', 'message': 'Conteúdo adicionado aos favoritos.'})

@login_required
def favoritos(request):
    # Obtém o perfil ativo da sessão
    perfil_id = request.session.get('perfil_id')
    if not perfil_id:
        messages.error(request, 'Nenhum perfil selecionado.')
        return redirect('escolherusuario')

    perfil = get_object_or_404(Perfil, id=perfil_id, usuario=request.user)
    
    # Busca os favoritos do perfil
    favoritos = Favorito.objects.filter(perfil=perfil).select_related('conteudo')
    
    context = {
        'favoritos': favoritos,
    }
    return render(request, 'favoritos.html', context)


def adicionar_historico(request, perfil_id, conteudo_id):
    perfil = get_object_or_404(Perfil, id=perfil_id)
    conteudo = get_object_or_404(Conteudo, id=conteudo_id)

    # Adiciona ao histórico de visualização
    HistoricoVisualizacao.objects.create(perfil=perfil, conteudo=conteudo)

    return JsonResponse({'status': 'success', 'message': 'Conteúdo adicionado ao histórico.'})







@login_required(login_url='paginalogin')
def assinaturas(request):
    try:
        # Tenta buscar a assinatura do usuário logado
        assinatura = Assinatura.objects.get(usuario=request.user)

        # Descriptografa os dados do cartão
        numero_cartao = decrypt_data(assinatura.numero_cartao_criptografado)
        nome_cartao = decrypt_data(assinatura.nome_cartao_criptografado)
        validade = decrypt_data(assinatura.validade_criptografada)
        cvv = decrypt_data(assinatura.cvv_criptografado)

        # Formata o número do cartão para exibição (mascarado)
        numero_cartao_mascarado = f"**** **** **** {numero_cartao[-4:]}"  # Exibe os últimos 4 dígitos
        nome_exibicao = nome_cartao

        # Mapeamento de planos para preços
        precos_planos = {
            'basico': '19,00',
            'padrao': '29,00',
            'premium': '55,00',
            'padrao_music': '35,00',
        }

        # Obtém o preço do plano escolhido
        valor_plano = precos_planos.get(assinatura.plano, 'Valor não encontrado')

        # Histórico de pagamentos (simulação)
        historico_pagamentos = [
            {
                'data': assinatura.data_inicio + timezone.timedelta(days=30),
                'id_transacao': '290348c0982...',
                'valor': valor_plano,
            },
            {
                'data': assinatura.data_inicio + timezone.timedelta(days=60),
                'id_transacao': '345987bc321...',
                'valor': valor_plano,
            },
            {
                'data': assinatura.data_inicio + timezone.timedelta(days=90),
                'id_transacao': '987654lkj32...',
                'valor': valor_plano,
            },
        ]

        # Lista de planos disponíveis
        planos = [
            {
                'titulo': 'Básico',
                'descricao': 'Filmes, séries e docs em qualidade aceitável para você curtir o Cinespace.',
                'preco': precos_planos.get('basico', 'Valor não encontrado'),
                'periodo': '/mês',
                'infos': ['1080p', '1 tela', 'Com anúncios', 'Acesso via PC, celular e TV', 'Catálogo limitado', 'Sem suporte prioritário'],
                'tipo': 'basico',  # Identificador do plano
                'upgrade': False,  # Indica se é um upgrade
            },
            {
                'titulo': 'Padrão',
                'descricao': 'Filmes, séries e docs em qualidade aceitável para você curtir o Cinespace.',
                'preco': precos_planos.get('padrao', 'Valor não encontrado'),
                'periodo': '/mês',
                'infos': ['1080p', '4 telas', 'Sem anúncios', 'SPACE MUSIC (com anúncios)', 'Download limitado', 'Catálogo completo'],
                'tipo': 'padrao',  # Identificador do plano
                'upgrade': True,  # Indica se é um upgrade
            },
            {
                'titulo': 'Padrão Music',
                'descricao': 'Cinespace + Space Music: filmes, séries, músicas e podcasts em um só lugar!',
                'preco': precos_planos.get('padrao_music', 'Valor não encontrado'),
                'periodo': '/mês',
                'infos': ['1080p', '4 telas', 'Sem anúncios', 'SPACE MUSIC', 'Download limitado', 'Catálogo completo'],
                'tipo': 'padrao_music',  # Identificador do plano
                'upgrade': False,  # Indica que é um upgrade
            },
            {
                'titulo': 'Premium',
                'descricao': 'Aproveite o Cinespace com a melhor qualidade de imagem e som, com benefícios exclusivos.',
                'preco': precos_planos.get('premium', 'Valor não encontrado'),
                'periodo': '/mês',
                'infos': ['4K (Ultra HD) + HDR', '6 telas', 'Sem anúncios', 'SPACE SPORTS', 'Download ilimitado', 'Conteúdo exclusivo'],
                'tipo': 'premium',  # Identificador do plano
                'upgrade': False,  # Indica que é um upgrade
            },
        ]

        # Contexto para o template
        context = {
            'assinatura': assinatura,
            'nome_exibicao': nome_exibicao,
            'numero_cartao_mascarado': numero_cartao_mascarado,
            'proxima_cobranca': assinatura.proxima_cobranca,
            'historico_pagamentos': historico_pagamentos,
            'nome_pagante': request.user.nome_usuario,
            'planos': planos,
            'plano_atual': assinatura.plano,  # Corrigido para usar o plano da assinatura
        }

        return render(request, 'controle_usuario/assinaturas.html', context)

    except Assinatura.DoesNotExist:
        # Usuário não tem assinatura
        context = {
            'mensagem': 'Você não possui uma assinatura ativa.',
            'nome_pagante': request.user.nome_usuario,
        }
        return render(request, 'controle_usuario/assinaturas.html', context)

# ---------- Funções Genéricas Protegidas ----------

@login_required(login_url='paginalogin')
def render_page(request, page_name):
    return render(request, f'{page_name}.html')

@login_required(login_url='paginalogin')
def series(request):
    return render_page(request, 'subpaginas/series')

@login_required(login_url='paginalogin')
def lancamentos(request):
    return render_page(request, 'lancamentos')

@login_required(login_url='paginalogin')
def filmes(request):
    return render_page(request, 'subpaginas/filmes')

@login_required(login_url='paginalogin')
def doramas(request):
    return render_page(request, 'subpaginas/doramas')

@login_required(login_url='paginalogin')
def esportes(request):
    return render_page(request, 'subpaginas/esportes')

@login_required(login_url='paginalogin')
def animes(request):
    return render(request, 'subpaginas/animes.html')

@login_required(login_url='paginalogin')
def cinetrailers(request):
    nome_usuario = request.session.get('nome_usuario', None)
    return render(request, 'cinetrailers.html', {'nome_usuario': nome_usuario})

@login_required
def the_last_of_us(request):
    return render(request, 'series/thelastofus.html')

@login_required
def vingadores_ultimato(request):
    return render(request, 'filmes/vingadores-ultimato.html')

@login_required
def bad_boys4(request):
    return render(request, 'filmes/bad-boys4.html')

@login_required(login_url='paginalogin')
def ajuda(request):
    return render(request, 'controle_usuario/ajuda.html')

@login_required(login_url='paginalogin')
def assinaturas(request):
    return render(request, 'controle_usuario/assinaturas.html')

@login_required(login_url='paginalogin')
def configuracoes(request):
    return render(request, 'controle_usuario/configuracoes.html')

@login_required(login_url='paginalogin')
def escolherplataforma(request):
    return render(request, 'usuario/escolherplataforma.html')


@login_required(login_url='paginalogin')
def favoritos(request):
    return render(request, 'favoritos.html')

@login_required(login_url='paginalogin')
def conta(request):
    return render(request, 'controle_usuario/conta.html')

@login_required(login_url='paginalogin')
def gerenciar_dispositivos(request):
    return render(request, 'controle_usuario/gerenciar_dispositivos.html')

class CustomPasswordResetView(PasswordResetView):
    template_name = 'registration/password_reset_form.html'
    email_template_name = 'registration/password_reset_email.html'
    success_url = reverse_lazy('password_reset_done')

    def form_valid(self, form):
        email = form.cleaned_data['email']

        # Verifica se o email existe no banco de dados
        if not Usuario.objects.filter(email=email).exists():
            messages.error(self.request, 'O email informado não está cadastrado.', extra_tags='login')
            return self.render_to_response(self.get_context_data(form=form))

        try:
            # Chama o método da classe pai para enviar o email
            return super().form_valid(form)
        except Exception as e:
            # Registra o erro para depuração
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro ao enviar email de redefinição de senha: {e}")
            messages.error(self.request, 'Ocorreu um erro ao enviar o email. Tente novamente mais tarde.', extra_tags='login')
            return self.render_to_response(self.get_context_data(form=form))
        
class CustomPasswordResetDoneView(PasswordResetDoneView):
    template_name = 'registration/password_reset_done.html'  # Template para a página de confirmação


class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'registration/password_reset_confirm.html'
    success_url = reverse_lazy('password_reset_complete')

    def form_valid(self, form):
        password1 = form.cleaned_data.get('new_password1')
        password2 = form.cleaned_data.get('new_password2')

        # Verifica se as senhas coincidem
        if password1 != password2:
            messages.error(self.request, "As senhas não coincidem.", extra_tags='password_reset')
            return redirect(self.request.path)

        # Verifica os requisitos da senha
        has_uppercase = any(c.isupper() for c in password1)
        has_lowercase = any(c.islower() for c in password1)
        has_number = any(c.isdigit() for c in password1)
        has_special_char = any(c in "!@#$%^&*(),.?\":{}|<>" for c in password1)

        if len(password1) < 8 or not has_uppercase or not has_lowercase or not has_number or not has_special_char:
            messages.error(self.request, "A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial.", extra_tags='password_reset')
            return redirect(self.request.path)

        return super().form_valid(form)

class CustomPasswordResetCompleteView(PasswordResetCompleteView):
    template_name = 'registration/password_reset_complete.html'  # Template para a conclusão


@csrf_exempt
def verificar_email_reset(request):
    """
    Verifica se o email existe no banco de dados para o processo de redefinição de senha.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email', '').strip()

            if not email:
                return JsonResponse({'exists': False, 'message': 'O campo de email não pode estar vazio.'}, status=400)

            # Verifica se o email existe no banco de dados
            exists = Usuario.objects.filter(email=email).exists()
            return JsonResponse({'exists': exists})
        except Exception as e:
            return JsonResponse({'exists': False, 'message': 'Erro ao processar a requisição.'}, status=500)
    return JsonResponse({'exists': False, 'message': 'Método não permitido.'}, status=405)
    
def encrypt_data(data: str):
    """
    Encrypts the given data using Fernet encryption.

    Args:
        data (str): The data to encrypt.

    Returns:
        bytes: The encrypted data as bytes, or None if data is None.
    """
    if data is None:
        return None

    key = settings.ENCRYPTION_KEY  # Get the key from settings
    f = Fernet(key)
    encrypted_data = f.encrypt(data.encode())  # Encrypt the data

    return encrypted_data

def decrypt_data(encrypted_data: bytes):
    """
    Decrypts the given encrypted data using Fernet decryption.

    Args:
        encrypted_data (bytes): The encrypted data to decrypt.

    Returns:
        str: The decrypted data as a string, or None if encrypted_data is None.
    """
    if encrypted_data is None:
        return None

    key = settings.ENCRYPTION_KEY  # Get the key from settings
    f = Fernet(key)
    decrypted_data = f.decrypt(encrypted_data).decode()  # Decrypt the data

    return decrypted_data

from .models import Dispositivo

@login_required(login_url='paginalogin')
def conta(request):
    try:
        usuario = request.user
        dispositivos = Dispositivo.objects.filter(usuario=usuario).order_by('-ultima_data_login')

        context = {
            'nome_usuario': usuario.nome_usuario,
            'email': usuario.email,
            'dispositivos': dispositivos,
        }

        return render(request, 'controle_usuario/conta.html', context)

    except Exception as e:
        logger.error(f"Erro ao exibir conta para o usuário {request.user.email}: {e}")
        context = {
            'mensagem': 'Ocorreu um erro ao carregar as informações da conta.',
            'nome_usuario': request.user.nome_usuario,
            'email': request.user.email,
            'dispositivos': [],
        }
        return render(request, 'controle_usuario/conta.html', context)

# Temporariamente, remova o decorador @login_required para testar
def registrar_dispositivo(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            sistema_operacional = data.get('sistema_operacional')

            dispositivo, created = Dispositivo.objects.get_or_create(
                usuario=request.user,
                sistema_operacional=sistema_operacional
            )

            if not created:
                dispositivo.ultima_data_login = timezone.now()
                dispositivo.save()

            return JsonResponse({"status": "ok"})

        except Exception as e:
            return JsonResponse({"status": "erro", "message": str(e)}, status=400)

    return JsonResponse({"status": "erro", "message": "Método inválido"}, status=400)


@csrf_exempt
def remover_dispositivo(request, dispositivo_id):
    if request.method == "POST":
        try:
            # Busca o dispositivo pelo ID e verifica se pertence ao usuário logado
            dispositivo = get_object_or_404(Dispositivo, id=dispositivo_id, usuario=request.user)
            
            # Remove o dispositivo
            dispositivo.delete()

            return redirect('/conta/')  # Redireciona para a página de contas após remover o dispositivo
        except Dispositivo.DoesNotExist:
            return JsonResponse({"status": "erro", "message": "Dispositivo não encontrado"}, status=404)
        except Exception as e:
            return JsonResponse({"status": "erro", "message": str(e)}, status=400)
    return JsonResponse({"status": "erro", "message": "Método inválido"}, status=400)

@csrf_exempt
def editar_nome_usuario(request):
    if request.method == "POST":
        data = json.loads(request.body)
        novo_nome = data.get("novo_nome")
        senha_atual = data.get("senha_atual")

        if not request.user.check_password(senha_atual):
            messages.error(request, "Senha atual incorreta.", extra_tags="conta")
            return JsonResponse({"success": False, "message": "Senha atual incorreta."})

        request.user.nome_usuario = novo_nome
        request.user.save()
        messages.success(request, "Nome de usuário atualizado com sucesso!", extra_tags="conta")
        return JsonResponse({"success": True})

    return JsonResponse({"success": False, "message": "Método inválido."})

@csrf_exempt
def editar_senha(request):
    if request.method == "POST":
        data = json.loads(request.body)
        senha_atual = data.get("senha_atual")
        nova_senha = data.get("nova_senha")
        confirmar_senha = data.get("confirmar_senha")

        # Verifica se as senhas coincidem
        if nova_senha != confirmar_senha:
            messages.error(request, "As senhas não coincidem.", extra_tags="conta")
            return JsonResponse({"success": False, "message": "As senhas não coincidem."})

        # Verifica a senha atual
        if not request.user.check_password(senha_atual):
            messages.error(request, "Senha atual incorreta.", extra_tags="conta")
            return JsonResponse({"success": False, "message": "Senha atual incorreta."})

        # Atualiza a senha
        request.user.set_password(nova_senha)
        request.user.save()
        update_session_auth_hash(request, request.user)  # Mantém o usuário logado

        # Mensagem de sucesso
        messages.success(request, "Senha atualizada com sucesso!", extra_tags="conta")
        return JsonResponse({"success": True, "redirect_url": reverse("conta")})

    return JsonResponse({"success": False, "message": "Método inválido."})



def carrossel_doramas(request):
    try:
        # Filtra as mídias do tipo "dorama" e com a categoria "Dorama"
        doramas = Midia.objects.filter(tipo='dorama', categoria='Dorama')
        print(f"Total de Doramas encontrados: {doramas.count()}")  # Debug

        context = {
            'doramas': doramas
        }
        return render(request, 'cinetrailers.html', context)
    
    except Exception as e:
        print(f"Erro ao buscar Doramas: {e}")  # Debug
        context = {
            'doramas': []
        }
        return render(request, 'cinetrailers.html', context)
    
def criar_admin_temporario(request):
    if request.META.get('REMOTE_ADDR') != 'seu_ip_pessoal':  # proteção mínima
        return HttpResponse('Não autorizado', status=403)

    User = get_user_model()
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@admin.com', 'admin123')
        return HttpResponse('Superusuário criado com sucesso')
    return HttpResponse('Superusuário já existe')





