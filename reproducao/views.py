from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Progresso
from contas.models import Perfil
from pesquisa.models import Midia
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def salvar_progresso(request):
    if request.method == 'POST':
        try:
            # Extrai os dados do formulário
            perfil_id = request.POST.get('perfil_id')
            midia_id = request.POST.get('midia_id')
            episodio_numero = request.POST.get('episodio_numero', 0)
            current_time = request.POST.get('current_time')

            # Valida os dados
            if not all([perfil_id, midia_id, current_time]):
                logger.error("Dados incompletos na requisição")
                return JsonResponse({'status': 'error', 'message': 'Dados incompletos'}, status=400)

            # Verifica se o perfil e a mídia existem
            perfil = get_object_or_404(Perfil, id=perfil_id)
            midia = get_object_or_404(Midia, id=midia_id)

            # Salva ou atualiza o progresso
            progresso, created = Progresso.objects.update_or_create(
                perfil=perfil,
                midia=midia,
                episodio_numero=episodio_numero,
                defaults={'current_time': current_time}
            )

            logger.info(f"Progresso salvo: {progresso.id}")
            return JsonResponse({'status': 'success', 'message': 'Progresso salvo com sucesso'})

        except Exception as e:
            logger.error(f"Erro ao salvar progresso: {str(e)}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    else:
        return JsonResponse({'status': 'error', 'message': 'Método não permitido'}, status=405)