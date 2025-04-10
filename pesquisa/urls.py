from django.urls import path
from .views import *
from django.conf.urls import handler404
from reproducao.views import salvar_progresso



urlpatterns = [
    # Páginas de pesquisa e resultados
    path('', pesquisa_view, name='pesquisa'),
    path('pesquisa/pesquisa/', pesquisa_view, name='resultados'),  
    path('trailers/', trailer_list, name='trailer_list'),
    path('assistir_filmes_base/', assistir_filmes_base, name='assistir_filmes_base'),
    path('assistir_series_base/', assistir_series_base, name='assistir_series_base'),

    # Rotas de filmes e séries
    path('hollywood/topgunmaverick/', topgunmaverick, name='topgunmaverick'),
    path('hollywood/aprocuradafelicidade/', a_procurada_felicidade, name='aprocuradafelicidade'),
    path('hollywood/batmancaveliro/', batman_caveliro, name='batmancaveliro'),
    path('hollywood/homenaranhasemvolta/', homem_aranha_sem_volta, name='homenaranhasemvolta'),
    path('hollywood/interintrelar/', interestelar, name='interintrelar'),
    path('hollywood/opoderosochefao/', o_poderoso_chefa, name='opoderosochefao'),
    path('hollywood/vingadoresultimato/', vingador_resultimato, name='vingadorresultimato'),  # Mantenha a URL correta aqui
    path('hollywood/vivaavidaeumafesta/', viva_a_vida_e_uma_festa, name='vivaavidaeumafesta'),
    path('series/the-last-of-us/',the_last_of_us, name=' the_last_of_us'),


    
    # Usando as views do app 'reproducao'
    path('salvar-progresso/',salvar_progresso, name='salvar_progresso'),


    
    # Rotas de doramas
    path('doramas/aliceinbordelands/', alice_in_bordelands, name='aliceinbordelands'),
    path('doramas/allofusaredead/', all_of_us_are_dead, name='allofusaredead'),
    path('doramas/bloodhounds/', bloodhounds, name='bloodhounds'),
    path('doramas/mydemon/', my_demon, name='mydemon'),
    path('doramas/round6/', round_6, name='round6'),
    path('doramas/sweethome/', sweet_home, name='sweethome'),

    
    # Melhores filmes
    path('melhoresfilmes/badboys4/', bad_boys_4, name='badboys4'),
    path('melhoresfilmes/bordelands/', bordelands, name='bordelands'),
    path('melhoresfilmes/divertidamente2/', divertidamente_2, name='divertidamente2'),
    path('melhoresfilmes/granturismo/', gran_turismo, name='granturismo'),
    path('melhoresfilmes/minions4/', minions_4, name='minions4'),
    path('melhoresfilmes/oexorcismo/', o_exorcismo, name='oexorcismo'),
    path('melhoresfilmes/transformes5/', transformes_5, name='transformes5'),
    path('melhoresfilmes/umlugarsilencioso/', um_lugar_silencioso, name='umlugarsilencioso'),
    path('resultados/', pesquisa_view, name='resultados'),
    path('api/search/', search_api, name='search_api'),
    path('autocomplete/', autocomplete, name='autocomplete'),
    path('filmes/vingadores-ultimato/', vingadores_ultimato, name='vingadores-ultimato'),

]
handler404 = 'pesquisa.views.custom_404'