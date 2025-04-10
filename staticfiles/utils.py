from django.shortcuts import render

def render_movie_page(request, template_name):
    context = {
        'some_variable': 'value',  # Adicione variáveis que você deseja passar para o template
    }
    return render(request, template_name, context)