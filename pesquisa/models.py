from django.db import models

class Genero(models.Model):
    nome = models.CharField(max_length=255, unique=True)  # Aumente o tamanho máximo

    def __str__(self):
        return self.nome

class Ator(models.Model):
    nome = models.CharField(max_length=255, default="Nome Indefinido")

    def __str__(self):
        return self.nome

class Midia(models.Model):
    TIPO_CHOICES = [
        ('filme', 'Filme'),
        ('serie', 'Série'),
    ]

    IDADE_CHOICES = [
        ('L', 'Livre'),
        ('10', '10+'),
        ('12', '12+'),
        ('14', '14+'),
        ('16', '16+'),
        ('18', '18+'),
    ]

    titulo = models.CharField(max_length=255, default="Título Indefinido")
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES, default='filme')
    image_url = models.URLField(max_length=200, default="sem_img")
    url = models.URLField(max_length=200, default="sem_url")
    generos = models.ManyToManyField(Genero, blank=True)  # Relação com gêneros
    atores = models.ManyToManyField(Ator, blank=True)  # Relação com atores
    temporadas = models.IntegerField(null=True, blank=True)  # Apenas para séries
    ano = models.IntegerField(null=True, blank=True)
    classificacao = models.FloatField(null=True, blank=True)
    duracao = models.CharField(max_length=20, blank=True, null=True)  # Duração para filmes
    descricao = models.TextField(blank=True, null=True)
    categoria = models.CharField(max_length=50, blank=True, null=True)
    classificacao_idade = models.CharField(
        max_length=3,
        choices=IDADE_CHOICES,
        default='L',
        blank=True,
        null=True
    )

    def __str__(self):
        return self.titulo


