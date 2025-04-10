from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth import get_user_model


class Chat(models.Model):
    nome = models.CharField(max_length=255, blank=True)  # Nome do chat (pode ser gerado automaticamente)
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat {self.id} - {self.nome}"

class Message(models.Model):  # Consolidado em um único modelo
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='mensagens')
    sender = models.CharField(max_length=100)  # Quem enviou a mensagem (usuário ou bot)
    texto = models.TextField()  # Conteúdo da mensagem
    timestamp = models.DateTimeField(auto_now_add=True)  # Data e hora da mensagem
    is_user = models.BooleanField(default=False)  # Indica se a mensagem foi enviada pelo usuário

    def __str__(self):
        return f"{self.sender}: {self.texto[:50]}..."