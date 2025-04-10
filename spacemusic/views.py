from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from .models import Musica
from django.db.models import Sum, Q, Count
import random

@login_required
def space_music(request):
    return render(request, 'spacemusic/space_music.html')

@login_required
def pesquisa_music(request):
    return render(request, 'spacemusic/pesquisa_music.html')

def search_music(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return JsonResponse({'error': 'Nenhum termo de busca fornecido'}, status=400)

    try:
        # Filtra músicas, álbuns e artistas.  Usamos Q objects para combinar as condições.
        musicas = Musica.objects.filter(
            Q(titulo__icontains=query) | Q(album__icontains=query) | Q(artista__icontains=query)
        ).distinct()  # .distinct() aqui evita duplicatas *antes* de agrupar.

        # --- Músicas Agrupadas (Mantido) ---
        musicas_agrupadas = {}
        for musica in musicas.order_by('artista', '-visualizacoes'):  # Ordena para pegar as mais populares
            if musica.artista not in musicas_agrupadas:
                musicas_agrupadas[musica.artista] = []
            if len(musicas_agrupadas[musica.artista]) < 8:
                musicas_agrupadas[musica.artista].append(musica)

        musicas_data = []
        for artista, musicas_artista in musicas_agrupadas.items():
            for musica in musicas_artista:
                musicas_data.append({
                    'id': musica.id,
                    'titulo': musica.titulo,
                    'artista': musica.artista,
                    'album': musica.album,
                    'capa': musica.capa,
                    'arquivo': musica.arquivo,
                    'duracao': musica.duracao,
                    'visualizacoes': musica.visualizacoes,
                    'banner_artista': musica.banner_artista,
                })

        # --- Artistas Distintos (Nova Parte) ---
        artistas_distintos = musicas.values('artista', 'capa_artista').distinct()
        artistas_data = [
            {'artista': artista['artista'], 'capa_artista': artista['capa_artista']}
            for artista in artistas_distintos
        ]

        # --- Álbuns Distintos (Nova Parte) ---
        #  Precisamos pegar os álbuns relacionados às *músicas* encontradas.
        albuns_distintos = musicas.values('album', 'capa', 'artista', 'ano').distinct()
        albuns_data = [
            {'album': album['album'], 'capa': album['capa'], 'artista': album['artista'], 'ano': album['ano']}
            for album in albuns_distintos
        ]

        # --- Retornar Tudo Junto ---
        return JsonResponse({
            'data': musicas_data,
            'artistas': artistas_data,
            'albuns': albuns_data,
        })

    except Exception as e:
        print(f"Erro ao buscar músicas: {str(e)}")
        return JsonResponse({'error': 'Erro interno ao buscar músicas'}, status=500)


# --- Outras Views (Mantidas, com pequenas alterações) ---

@csrf_exempt
def inserir_musica(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            musica = Musica(
                titulo=data['titulo'],
                artista=data['artista'],
                album=data.get('album', ''),
                capa=data['capa'],
                arquivo=data['arquivo'],
                duracao=data['duracao'],
                visualizacoes=data['visualizacoes'],
                banner_artista = data.get('banner_artista', '') # Adicionei o campo banner_artista
            )
            musica.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'error': 'Método não permitido'}, status=405)

def buscar_musicas(request):
    try:
        musicas = Musica.objects.all().values(
            'titulo', 'artista', 'album', 'capa', 'arquivo', 'duracao', 'visualizacoes', 'categoria', 'ano','banner_artista'
        )
        musicas_list = list(musicas)
        return JsonResponse(musicas_list, safe=False)
    except Exception as e:
        print(f"Erro ao buscar músicas: {e}")
        return JsonResponse({'error': str(e)}, status=500)

# As views buscar_artistas e buscar_albuns NÃO SÃO MAIS NECESSÁRIAS para a pesquisa.
# Você pode mantê-las se forem usadas em *outras partes* do seu aplicativo.
# Mas para a funcionalidade de pesquisa, elas não são mais usadas.

def buscar_recomendacoes(request):
    try:
        musicas = list(Musica.objects.all())
        musicas_aleatorias = random.sample(musicas, min(5, len(musicas)))
        artistas = list(Musica.objects.values('artista', 'capa_artista').distinct()) # Corrigido: capa_artista
        artistas_aleatorios = random.sample(artistas, min(5, len(artistas)))
        albuns = list(Musica.objects.values('album', 'capa', 'artista').distinct())
        albuns_aleatorios = random.sample(albuns, min(5, len(albuns)))

        data = {
            'musicas': [{
                'titulo': musica.titulo,
                'artista': musica.artista,
                'capa': musica.capa,
            } for musica in musicas_aleatorias],
            'artistas': artistas_aleatorios,
            'albuns': albuns_aleatorios,
        }

        return JsonResponse(data)
    except Exception as e:
        print(f"Erro ao buscar recomendações: {e}")
        return JsonResponse({'error': str(e)}, status=500)



def buscar_albuns(request):
    try:
        query = request.GET.get('q', '').strip()  # Obtém o termo de pesquisa

        if query:
            # Filtra os álbuns que correspondem ao termo de pesquisa (nome do álbum, artista ou música)
            albuns = Musica.objects.filter(
                Q(album__icontains=query) |  # Nome do álbum
                Q(artista__icontains=query) |  # Nome do artista
                Q(titulo__icontains=query)  # Nome da música
            ).values('album', 'capa', 'artista', 'ano').annotate(
                total_visualizacoes=Sum('visualizacoes')
            ).order_by('-total_visualizacoes')[:10]  # Limita aos 10 álbuns mais relevantes
        else:
            # Retorna os álbuns mais populares (sem pesquisa)
            albuns = Musica.objects.values('album', 'capa', 'artista', 'ano').annotate(
                total_visualizacoes=Sum('visualizacoes')
            ).order_by('-total_visualizacoes')[:50]

        # Converte o QuerySet para uma lista
        albuns_list = list(albuns)

        # Retorna os dados como JSON
        return JsonResponse(albuns_list, safe=False)
    except Exception as e:
        print(f"Erro ao buscar álbuns: {e}")
        return JsonResponse({'error': str(e)}, status=500)
    
    
def buscar_artistas(request):
    try:
        query = request.GET.get('q', '').strip()

        if query:
            # Filtra os artistas que correspondem ao termo de pesquisa
            artistas = Musica.objects.filter(
                artista__icontains=query
            ).values('artista', 'capa_artista').annotate(
                num_musicas=Count('id')
            ).order_by('-num_musicas')[:10]  # Limita aos 10 artistas mais relevantes
        else:
            # Retorna os artistas mais populares (sem pesquisa)
            artistas = Musica.objects.values('artista', 'capa_artista').annotate(
                num_musicas=Count('id')
            ).order_by('-num_musicas')[:50]

        # Converte o QuerySet para uma lista
        artistas_list = list(artistas)

        # Retorna os dados como JSON
        return JsonResponse(artistas_list, safe=False)
    except Exception as e:
        print(f"Erro ao buscar artistas: {e}")
        return JsonResponse({'error': str(e)}, status=500)  



def buscar_albuns_customizados(request):
    try:
        albuns_data = {}
        albuns_utilizados = set()  # Conjunto para rastrear álbuns usados

        # --- Álbuns de Trap ---
        albuns_trap = Musica.objects.filter(genero='TRAP').values(
            'album', 'capa', 'artista', 'ano', 'genero'
        ).annotate(total_visualizacoes=Sum('visualizacoes')).order_by('-total_visualizacoes').distinct()
        albuns_trap_list = list(albuns_trap)
        albuns_data['Álbuns de Trap'] = albuns_trap_list
        for album in albuns_trap_list:
            albuns_utilizados.add(album['album'])  # Adiciona o nome do álbum ao conjunto

        # --- Álbuns Famosos (exemplo - por visualizações, mas pode ser outro critério) ---
        albuns_famosos = Musica.objects.exclude(album__in=albuns_utilizados).values( #exclui albuns ja utilizados
            'album', 'capa', 'artista', 'ano', 'genero'
        ).annotate(total_visualizacoes=Sum('visualizacoes')).order_by('-total_visualizacoes')[:10].distinct() #limita a 10
        albuns_famosos_list = list(albuns_famosos)
        albuns_data['Álbuns Famosos'] = albuns_famosos_list
        for album in albuns_famosos_list:
             albuns_utilizados.add(album['album'])

        # --- Álbuns Populares (permite repetição) ---
        albuns_populares = Musica.objects.values(
            'album', 'capa', 'artista', 'ano', 'genero'
        ).annotate(total_visualizacoes=Sum('visualizacoes')).order_by('-total_visualizacoes')[:20].distinct() #limita a 20
        albuns_data['Álbuns Populares'] = list(albuns_populares)

        # --- Adicione mais seções aqui, seguindo a mesma lógica ---
        # Exemplo: Álbuns de Funk
        albuns_funk = Musica.objects.filter(genero='FUNK').exclude(album__in=albuns_utilizados).values(
             'album', 'capa', 'artista', 'ano', 'genero'
        ).annotate(total_visualizacoes = Sum('visualizacoes')).order_by('-total_visualizacoes').distinct()

        albuns_funk_list = list(albuns_funk)
        albuns_data['Álbuns de Funk'] = albuns_funk_list

        for album in albuns_funk_list:
            albuns_utilizados.add(album['album'])


        return JsonResponse(albuns_data)

    except Exception as e:
        print(f"Erro ao buscar álbuns customizados: {e}")
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
@login_required
def salvar_historico(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            historico = HistoricoReproducao(
                usuario=request.user,
                musica_id=data['musica_id'],
                data_reproducao=timezone.now()
            )
            historico.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@login_required
def buscar_historico(request):
    try:
        historico = HistoricoReproducao.objects.filter(
            usuario=request.user
        ).order_by('-data_reproducao')[:20].select_related('musica')
        
        historico_data = [{
            'titulo': item.musica.titulo,
            'artista': item.musica.artista,
            'capa': item.musica.capa,
            'arquivo': item.musica.arquivo,
            'data_reproducao': item.data_reproducao.strftime('%Y-%m-%d %H:%M:%S')
        } for item in historico]
        
        return JsonResponse(historico_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def painel_musica_admin(request):
    return render(request, 'spacemusic/painelmusica_admin.html')

def spacemusic_album(request):
    return render(request, 'spacemusic/spacemusic_album.html')


def spacemusic_artistas(request):
    return render(request, 'spacemusic/spacemusic_artistas.html')

