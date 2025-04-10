# accounts/backends.py

from django.contrib.auth.backends import ModelBackend
from .models import Usuario  # Certifique-se de que esse caminho esteja correto

class PersonalizadoBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Aqui estamos assumindo que username é o email
            usuario = Usuario.objects.get(email=username)
        except Usuario.DoesNotExist:
            return None
        if usuario.check_password(password):
            return usuario
        return None
