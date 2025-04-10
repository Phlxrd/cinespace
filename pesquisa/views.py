from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Midia, Genero  # Importe o modelo Genero
from django.http import JsonResponse
from django.core.serializers import serialize
import json

def pesquisa_view(request):
    query = request.GET.get('query', '').strip()
    categoria = request.GET.get('categoria', '').strip()
    classificacao_idade = request.GET.get('classificacao_idade', '').strip()
    sort_by = request.GET.get('sort_by', '').strip()
    genero = request.GET.get('genero', '').strip()
    submitted = request.GET.get('submitted') is not None

    # Verifica se o termo pesquisado corresponde a um gênero
    if query:
        genero_correspondente = Genero.objects.filter(nome__iexact=query).first()
        if genero_correspondente:
            genero = genero_correspondente.nome  # Define o gênero para o filtro
            query = ''  # Limpa a query para evitar conflitos

    # Define se uma pesquisa foi realizada
    pesquisa_realizada = bool(query or categoria or classificacao_idade or sort_by or genero)

    if pesquisa_realizada:
        resultados = Midia.objects.all()

        # Aplica a pesquisa por texto, se houver
        if query:
            resultados = resultados.filter(titulo__icontains=query)

        # Aplica os filtros de categoria e classificação
        if categoria:
            categoria_lower = categoria.lower()  # Converter para minúsculas
            resultados = resultados.filter(categoria__iexact=categoria_lower)

        if classificacao_idade:
            resultados = resultados.filter(classificacao_idade=classificacao_idade)

        # Aplica o filtro por gênero, se houver
        if genero:
            resultados = resultados.filter(generos__nome__iexact=genero)

        # Aplica a ordenação
        if sort_by == 'ano':
            resultados = resultados.order_by('ano')
        elif sort_by == 'az':
            resultados = resultados.order_by('titulo')
        elif sort_by == 'recent':
            resultados = resultados.order_by('-ano')
    else:
        resultados = None

    # Verifica se há resultados para a pesquisa sem filtros
    resultados_sem_filtros = Midia.objects.filter(titulo__icontains=query) if query else None

    # Define se a mensagem de "Nenhum resultado encontrado" deve ser exibida
    exibir_mensagem = pesquisa_realizada and not resultados and query

    # Define se a mensagem específica para a categoria deve ser exibida
    exibir_mensagem_categoria = (
        pesquisa_realizada and not resultados and query and categoria
    )

    # Busca sugestões relacionadas se não houver resultados
    sugestoes_relacionadas = []
    if pesquisa_realizada and not resultados:
        sugestoes_relacionadas = Midia.objects.exclude(titulo__icontains=query).order_by('?')[:6]  # 6 sugestões aleatórias

    # Obtém todos os gêneros disponíveis para exibir no template
    generos_disponiveis = Genero.objects.all()

    context = {
        'resultados': resultados,
        'query': query,
        'categoria': categoria,
        'classificacao_idade': classificacao_idade,
        'genero': genero,  # Passa o gênero selecionado para o template
        'generos_disponiveis': generos_disponiveis,  # Passa a lista de gêneros para o template
        'pesquisa_realizada': pesquisa_realizada,
        'sugestoes_relacionadas': sugestoes_relacionadas,
        'exibir_mensagem': exibir_mensagem,  # Controla a exibição da mensagem geral
        'exibir_mensagem_categoria': exibir_mensagem_categoria,  # Controla a exibição da mensagem específica para a categoria
        'resultados_sem_filtros': resultados_sem_filtros,  # Resultados sem filtros para verificar se há resultados em outras categorias
    }
    return render(request, 'pesquisa/pesquisa.html', context)
    
def search_api(request):
    query = request.GET.get('query', '').strip()
    if query:
        resultados = Midia.objects.filter(titulo__icontains=query)
        data = [{
            'titulo': item.titulo,
            'url': item.url,
            'image_url': item.image_url,
            'ano': item.ano,
            'classificacao': item.classificacao,
        } for item in resultados]
    else:
        data = []  # Retorna uma lista vazia se não houver busca
    return JsonResponse(data, safe=False)

def pagina_pesquisa(request):
    query = request.GET.get('query', '').strip()
    data_do_banco_html = None

    if query :
        resultados  = Midia.objects.filter(titulo__icontains=query)

        data_do_banco = [{
            'title': r.titulo, 'image_url':r.image_url,
            'url':r.url,       'year': r.ano,
            'classificacao': r.classificacao, 'id': r.id ,
                } for r in resultados]
        data_do_banco_html   =  json.dumps(data_do_banco, ensure_ascii=False )

    data_context = {
        'resultados' :data_do_banco_html ,
        'searchQ':    query  }
    return render(request , "pesquisa/pesquisa.html" ,data_context )


def autocomplete(request):
    query = request.GET.get('query', '').strip()
    if query:
        # Busca no banco de dados por títulos que contenham a query
        resultados = Midia.objects.filter(titulo__icontains=query)[:10]  # Limita a 10 resultados
        sugestoes = [{'titulo': item.titulo} for item in resultados]
    else:
        sugestoes = []  # Retorna uma lista vazia se não houver query
    return JsonResponse(sugestoes, safe=False)
# Lista de trailers (filmes/séries)

def trailer_list(request):
    trailers = Midia.objects.all()  # Busca todos os filmes/séries
    return render(request, 'pesquisa/trailer_list.html', {'trailers': trailers})


# Página inicial (index)
@login_required
def index(request):
    return render(request, 'index.html')

# Página de cinetrailers
@login_required
def cinetrailers(request):
    return render(request, 'cinetrailers.html')

# Páginas de filmes e séries (genéricas)
@login_required
def render_movie_page(request, movie_name):
    return render(request, f'{movie_name}.html')

# Páginas específicas de filmes
@login_required
def topgunmaverick(request):
    return render(request, 'hollywood/topgunmaverick.html')

@login_required
def a_procurada_felicidade(request):
    return render(request, 'hollywood/aprocuradafelicidade.html')

@login_required
def batman_caveliro(request):
    return render(request, 'hollywood/batmancaveliro.html')

@login_required
def homem_aranha_sem_volta(request):
    return render(request, 'hollywood/homenaranhasemvolta.html')

@login_required
def interestelar(request):
    return render(request, 'hollywood/interintrelar.html')

@login_required
def o_poderoso_chefa(request):
    return render(request, 'hollywood/opoderosochefao.html')

@login_required
def vingador_resultimato(request):
    return render(request, 'hollywood/vingadoresultimato.html')

@login_required
def viva_a_vida_e_uma_festa(request):
    return render(request, 'hollywood/vivaavidaeumafesta.html')

@login_required
def vingadores_ultimato(request):
    return render(request, 'filmes/vingadores-ultimato.html')

@login_required
def the_last_of_us(request):
    return render(request, 'series/thelastofus.html')

@login_required
def alice_in_bordelands(request):
    return render(request, 'doramas/aliceinbordelands.html')

@login_required
def all_of_us_are_dead(request):
    return render(request, 'doramas/allofusaredead.html')

@login_required
def bloodhounds(request):
    return render(request, 'doramas/bloodhounds.html')

@login_required
def my_demon(request):
    return render(request, 'doramas/mydemon.html')

@login_required
def round_6(request):
    return render(request, 'doramas/round6.html')

@login_required
def sweet_home(request):
    return render(request, 'doramas/sweethome.html')

# Páginas específicas de melhores filmes
@login_required
def bad_boys_4(request):
    return render(request, 'melhoresfilmes/badboys4.html')

@login_required
def bordelands(request):
    return render(request, 'melhoresfilmes/bordelands.html')

@login_required
def divertidamente_2(request):
    return render(request, 'melhoresfilmes/divertidamente2.html')

@login_required
def gran_turismo(request):
    return render(request, 'melhoresfilmes/granturismo.html')

@login_required
def minions_4(request):
    return render(request, 'melhoresfilmes/minions4.html')

@login_required
def o_exorcismo(request):
    return render(request, 'melhoresfilmes/oexorcismo.html')

@login_required
def transformes_5(request):
    return render(request, 'melhoresfilmes/transformes5.html')

@login_required
def um_lugar_silencioso(request):
    return render(request, 'melhoresfilmes/umlugarsilencioso.html')

# Páginas base para assistir filmes e séries
@login_required
def assistir_filmes_base(request):
    return render(request, 'assistir_filmes_base.html')

@login_required
def assistir_series_base(request):
    return render(request, 'assistir_series_base.html')

# Página de erro 404
def custom_404(request, exception):
    return render(request, '404.html', status=404)



def carrossel_doramas(request):
    try:
        # Filtra as mídias com a categoria "Doramas"
        doramas = Midia.objects.filter(categoria='Doramas')
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