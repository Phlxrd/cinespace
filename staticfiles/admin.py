from django.contrib import admin
from .models import Genero, Ator, Midia

@admin.register(Genero)
class GeneroAdmin(admin.ModelAdmin):
    list_display = ('nome',)

@admin.register(Ator)
class AtorAdmin(admin.ModelAdmin):
    list_display = ('nome',)

@admin.register(Midia)
class MidiaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'tipo', 'ano', 'classificacao', 'classificacao_idade')  # Adicionado
    list_filter = ('tipo', 'generos', 'classificacao_idade')  # Adicionado
    search_fields = ('titulo', 'descricao')