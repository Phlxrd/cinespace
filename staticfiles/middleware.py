from django.utils.timezone import now
from django.contrib.gis.geoip2 import GeoIP2
from ipware import get_client_ip
from .models import Dispositivo, Perfil, Assinatura # Importe Assinatura!
from django.shortcuts import redirect
from django.contrib import messages

def get_location(ip):
    try:
        geo = GeoIP2()
        country = geo.country(ip)["country_name"]
        return country
    except Exception:
        return "Desconhecido"

class TrackUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.user.is_authenticated:
            ip, is_routable = get_client_ip(request)
            if ip is None:
                ip = "0.0.0.0"

            country = get_location(ip)

            # Atualiza ou cria um registro do dispositivo
            dispositivo, created = Dispositivo.objects.update_or_create(
                usuario=request.user,
                ip=ip,
                defaults={
                    "ultima_data_login": now(),
                    "sistema_operacional": request.META.get("HTTP_USER_AGENT", "Desconhecido"),
                    "pais": country
                }
            )

        return response

class PerfilMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            perfil_id = request.session.get('perfil_id')
            if perfil_id:
                try:
                    perfil = Perfil.objects.get(id=perfil_id, usuario=request.user)
                    request.perfil = perfil
                    request.nome_perfil = perfil.nome_usuario
                except Perfil.DoesNotExist:
                    request.perfil = None
                    request.nome_perfil = None

            try:
                assinatura = Assinatura.objects.get(usuario=request.user)
                request.plano = assinatura.plano
            except Assinatura.DoesNotExist:
                request.plano = None

        else:
            request.perfil = None
            request.nome_perfil = None
            request.plano = None

        response = self.get_response(request)
        return response