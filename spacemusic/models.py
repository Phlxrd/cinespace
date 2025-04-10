from django.db import models

class Musica(models.Model):
    CATEGORIAS = [
        ('PHONK', 'Phonk'),
        ('FUNK', 'Funk'),
        ('TRAP', 'Trap'),
        ('SERTANEJO', 'Sertanejo'),
        ('PAGODE', 'Pagode'),
        ('ROCK', 'Rock'),
        ('POP', 'Pop'),
        ('JAZZ', 'Jazz'),
        ('ELETRONICA', 'Eletrônica'),
        ('RAP', 'Rap'),
        ('INDIE', 'Indie'),
        ('REGGAE', 'Reggae'),
        ('MPB', 'MPB'),
        ('CLASSICA', 'Clássica'),
        ('BLUES', 'Blues'),
        ('METAL', 'Metal'),
        ('COUNTRY', 'Country'),
        ('KPOP', 'K-Pop'),
        ('HIPHOP', 'Hip-Hop'),
        ('R&B', 'R&B'),
        # Adicione mais categorias conforme necessário
    ]

    titulo = models.CharField(max_length=255)
    artista = models.CharField(max_length=255)
    album = models.CharField(max_length=255, blank=True, null=True)
    capa = models.URLField(max_length=500, blank=True, null=True)
    arquivo = models.URLField(max_length=500, blank=True, null=True)  # Campo arquivo vazio
    duracao = models.IntegerField(help_text="Duração em segundos", blank=True, null=True)
    visualizacoes = models.IntegerField(default=0, blank=True, null=True)
    capa_artista = models.URLField(max_length=500, blank=True, null=True)  # URL da foto do artista
    banner_artista = models.URLField(max_length=500, blank=True, null=True)  # URL do banner do artista
    categoria = models.CharField(max_length=50, choices=CATEGORIAS, blank=True, null=True)
    ano = models.IntegerField(blank=True, null=True)
    genero = models.CharField(max_length=50, blank=True, null=True)  # Gênero da música
    link_album = models.URLField(max_length=500, blank=True, null=True)  # Link para o álbum
    link_artista = models.URLField(max_length=500, blank=True, null=True)  # Link para o artista
    numero_faixas = models.IntegerField(default=0, blank=True, null=True)  # Número de faixas no álbum
    duracao_album = models.IntegerField(blank=True, null=True)  # Duração total do álbum em segundos
    popularidade_artista = models.IntegerField(blank=True, null=True)  # Número de fãs do artista

    def __str__(self):
        return f"{self.titulo} - {self.artista}"