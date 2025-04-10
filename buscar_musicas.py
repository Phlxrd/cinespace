import requests
from spacemusic.models import Musica  # Substitua 'spacemusic' pelo nome do seu app Django

# Lista dos artistas/bandas
artistas_famosos = [
    "Travis Scott", "Bruno Mars", "The Weeknd", "Racionais", "Ed Sheeran",
    "AC/DC", "Eminem", "Grelo", "Pericles", "Matuê", "Linkin Park",  # Teto substituído por Linkin Park
    "Imagine Dragons", "Adele", "Coldplay", "Taylor Swift", "Drake",
    "Slipknot", "Sabotage", "San Holo", "Lil Uzi Vert", "XXXTentacion"
]

# ID da Adele na API do Deezer
ADELE_ID = 75798

def buscar_albuns_artista(artista_id):
    """Busca todos os álbuns de um artista."""
    url_albuns = f"https://api.deezer.com/artist/{artista_id}/albums"
    response = requests.get(url_albuns)
    if response.status_code != 200:
        print(f"Erro ao buscar álbuns do artista {artista_id}: {response.status_code}")
        return []
    dados = response.json()
    return dados.get('data', [])

def buscar_musicas_album(album_id):
    """Busca todas as músicas de um álbum."""
    url_musicas = f"https://api.deezer.com/album/{album_id}/tracks"
    response = requests.get(url_musicas)
    if response.status_code != 200:
        print(f"Erro ao buscar músicas do álbum {album_id}: {response.status_code}")
        return []
    dados = response.json()
    return dados.get('data', [])

def buscar_genero_por_id(genero_id):
    """Busca o nome do gênero com base no ID."""
    url_genero = f"https://api.deezer.com/genre/{genero_id}"
    response = requests.get(url_genero)
    if response.status_code != 200:
        return "Desconhecido"
    dados = response.json()
    return dados.get('name', 'Desconhecido')

def buscar_artista_correto(nome_artista, dados_artista):
    """Filtra o artista correto na resposta da API."""
    for artista in dados_artista['data']:
        # Compara os nomes ignorando maiúsculas/minúsculas e espaços extras
        if artista['name'].strip().lower() == nome_artista.strip().lower():
            return artista
    return None

def buscar_musicas_artista(nome_artista, artista_id=None, limite_musicas=15):
    try:
        if nome_artista.lower() == "adele":
            # Usa o ID diretamente para a Adele
            artista_id = ADELE_ID
            url_artista = f"https://api.deezer.com/artist/{artista_id}"
            response_artista = requests.get(url_artista)
            if response_artista.status_code != 200:
                print(f"Erro ao buscar artista: {response_artista.status_code}")
                return 0

            dados_artista = response_artista.json()
            artista_nome = dados_artista.get('name', nome_artista)
            capa_artista = dados_artista.get('picture_medium', '')  # URL da foto do artista
            banner_artista = dados_artista.get('picture_xl', '')  # URL do banner do artista
        else:
            # Busca o artista pelo nome
            url_artista = f"https://api.deezer.com/search/artist?q={nome_artista}"
            response_artista = requests.get(url_artista)
            if response_artista.status_code != 200:
                print(f"Erro ao buscar artista: {response_artista.status_code}")
                return 0

            dados_artista = response_artista.json()
            if not dados_artista['data']:
                print(f"Artista '{nome_artista}' não encontrado.")
                return 0

            # Filtra o artista correto
            artista_correto = buscar_artista_correto(nome_artista, dados_artista)
            if not artista_correto:
                print(f"Artista '{nome_artista}' não encontrado na resposta da API.")
                return 0

            artista_id = artista_correto['id']  # Pega o ID do artista correto
            artista_nome = artista_correto['name']  # Nome do artista
            capa_artista = artista_correto.get('picture_medium', '')  # URL da foto do artista
            banner_artista = artista_correto.get('picture_xl', '')  # URL do banner do artista

        # Busca os dados do artista
        popularidade_artista = dados_artista.get('nb_fan', 0)  # Número de fãs do artista

        # Busca todos os álbuns do artista
        albuns = buscar_albuns_artista(artista_id)
        musicas_salvas = 0  # Contador de músicas salvas para o artista

        for album in albuns:
            if musicas_salvas >= limite_musicas:
                break  # Para de buscar músicas se o limite for atingido

            album_id = album.get('id')
            album_nome = album.get('title', 'Álbum Desconhecido')
            capa_album = album.get('cover_medium', '')
            link_album = album.get('link', '')
            numero_faixas = album.get('nb_tracks', 0)
            duracao_album = album.get('duration', 0)
            ano_album = album.get('release_date', '').split('-')[0] if album.get('release_date') else None

            # Limita o nome do álbum a 20 caracteres
            album_nome = album_nome[:20]

            # Busca todas as músicas do álbum
            musicas = buscar_musicas_album(album_id)
            for musica in musicas:
                if musicas_salvas >= limite_musicas:
                    break  # Para de salvar músicas se o limite for atingido

                try:
                    titulo = musica.get('title', 'Título Desconhecido')
                    duracao = musica.get('duration', 0)
                    visualizacoes = musica.get('rank', 0)  # Número de visualizações (popularidade)
                    genero_id = musica.get('genre_id', '')  # ID do gênero da música
                    genero = buscar_genero_por_id(genero_id)  # Nome do gênero

                    # Limita o título da música a 12 caracteres
                    titulo = titulo[:12]

                    # Verifica se a música já existe no banco de dados
                    if not Musica.objects.filter(titulo=titulo, artista=artista_nome, album=album_nome).exists():
                        nova_musica = Musica(
                            titulo=titulo,
                            artista=artista_nome,
                            album=album_nome,
                            capa=capa_album,
                            arquivo=None,  # Campo arquivo vazio
                            duracao=duracao,
                            visualizacoes=visualizacoes,
                            categoria=genero,  # Define a categoria com base no gênero
                            ano=ano_album,
                            genero=genero,
                            link_album=link_album,
                            link_artista=f"https://www.deezer.com/artist/{artista_id}",
                            numero_faixas=numero_faixas,
                            duracao_album=duracao_album,
                            popularidade_artista=popularidade_artista,
                            capa_artista=capa_artista,  # Salva a capa do artista
                            banner_artista=banner_artista  # Salva o banner do artista
                        )
                        nova_musica.save()
                        musicas_salvas += 1
                        print(f"Música salva: {titulo} - {artista_nome} (Álbum: {album_nome})")

                except Exception as e:
                    print(f"Erro ao salvar música: {e}")

        return musicas_salvas  # Retorna o número de músicas salvas para o artista

    except Exception as e:
        print(f"Erro ao buscar músicas do artista {nome_artista}: {e}")
        return 0

# Função para buscar músicas de todos os artistas
def buscar_musicas_todos_artistas(artistas_famosos):
    for artista in artistas_famosos:
        print(f"Buscando músicas para o artista: {artista}")
        buscar_musicas_artista(artista, limite_musicas=15)

# Executa a busca de músicas para todos os artistas
buscar_musicas_todos_artistas(artistas_famosos)