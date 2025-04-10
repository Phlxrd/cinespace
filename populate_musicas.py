import os
import django
import json

# Configura o Django para usar o settings do projeto
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cinespace.settings')
django.setup()

from spacemusic.models import Musica  # Importe o modelo Musica do app spacemusic

# Função principal para popular o banco de dados com músicas
def populate_musicas():
    # Limpa as músicas existentes (opcional)
    Musica.objects.all().delete()

    # Carregue o arquivo JSON com os dados das músicas
    with open('dados_musicas.json', 'r', encoding='utf-8') as file:
        musicas_data = json.load(file)

    # Insira cada música no banco de dados
    for musica_data in musicas_data:
        Musica.objects.create(
            titulo=musica_data['titulo'],
            artista=musica_data['artista'],
            capa=musica_data['capa'],
            arquivo=musica_data['arquivo'],
            duracao=musica_data['duracao'],
            visualizacoes=musica_data['visualizacoes'],
            album=musica_data['album'],
            ano=musica_data['ano'],
            categoria=musica_data['categoria'],
            duracao_album=musica_data['duracao_album'],
            genero=musica_data['genero'],
            link_album=musica_data['link_album'],
            link_artista=musica_data['link_artista'],
            numero_faixas=musica_data['numero_faixas'],
            popularidade_artista=musica_data['popularidade_artista'],
            banner_artista=musica_data['banner_artista'],
            capa_artista=musica_data['capa_artista']
        )
        print(f"Adicionado: {musica_data['titulo']} - {musica_data['artista']}")

    print("Músicas populadas com sucesso!")

# Executa o script
if __name__ == '__main__':
    print("Populando o banco de dados com músicas...")
    populate_musicas()