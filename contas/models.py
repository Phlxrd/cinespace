from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import make_password, check_password
from cryptography.fernet import Fernet
from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.conf import settings

class Perfil(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='perfis')
    nome_usuario = models.CharField(max_length=100)  # Mantenha apenas este
    imagem = models.ImageField(upload_to='imagens_perfis/', blank=True, null=True)
    data_nascimento = models.DateField(null=True, blank=True)
    perfil_infantil = models.BooleanField(default=False)

    def __str__(self):
        return self.nome_usuario  # Use apenas nome_usuario aqui
    

class Conteudo(models.Model):
    titulo = models.CharField(max_length=255)
    descricao = models.TextField()
    tipo = models.CharField(max_length=50, choices=[('filme', 'Filme'), ('serie', 'Série')])
    imagem = models.ImageField(upload_to='conteudos/', blank=True, null=True)
    data_lancamento = models.DateField()
    classificacao = models.FloatField(default=0.0)
    url = models.CharField(max_length=255, blank=True, null=True)
    categoria = models.CharField(max_length=100, blank=True, null=True)
    classificacao_idade = models.CharField(max_length=10, blank=True, null=True)
    generos = models.JSONField(default=list)  # Armazena gêneros como uma lista

    def __str__(self):
        return self.titulo

class ContinueAssistindo(models.Model):
    perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE, related_name='continue_assistindo')
    conteudo = models.ForeignKey(Conteudo, on_delete=models.CASCADE)
    tempo_assistido = models.DurationField()  # Tempo assistido (em segundos)
    ultima_visualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('perfil', 'conteudo')  # Evita duplicações

    def __str__(self):
        return f"{self.perfil.nome_usuario} - {self.conteudo.titulo}"

class Favorito(models.Model):
    perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE, related_name='favoritos')
    conteudo = models.ForeignKey(Conteudo, on_delete=models.CASCADE)
    data_adicao = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('perfil', 'conteudo')  # Evita duplicações

    def __str__(self):
        return f"{self.perfil.nome_usuario} - {self.conteudo.titulo}"

class HistoricoVisualizacao(models.Model):
    perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE, related_name='historico_visualizacao')
    conteudo = models.ForeignKey(Conteudo, on_delete=models.CASCADE)
    data_visualizacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.perfil.nome_usuario} - {self.conteudo.titulo} ({self.data_visualizacao})"        
# Gerenciador para o modelo Usuario
class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O endereço de email deve ser fornecido")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser deve ter is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser deve ter is_superuser=True.")

        return self.create_user(email, password, **extra_fields)

# Modelo Usuario
class Usuario(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=100, unique=True)
    nome_usuario = models.CharField(max_length=100, unique=True)
    plano = models.CharField(max_length=50, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nome_usuario']

    def __str__(self):
        return self.email

# Modelo Assinatura
class Assinatura(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='assinatura')
    plano = models.CharField(max_length=50, verbose_name=_("Plano da Assinatura"))
    tipo_pagamento = models.CharField(max_length=20, verbose_name=_("Tipo de Pagamento"))
    tipo_plano = models.CharField(max_length=10, choices=[('mensal', 'Mensal'), ('anual', 'Anual')], default='mensal')
    numero_cartao_criptografado = models.CharField(max_length=200, blank=True, null=True, verbose_name=_("Número do Cartão (Criptografado)"))
    nome_cartao_criptografado = models.CharField(max_length=200, blank=True, null=True, verbose_name=_("Nome no Cartão (Criptografado)"))
    validade_criptografada = models.CharField(max_length=200, blank=True, null=True, verbose_name=_("Validade (Criptografada)"))
    cvv_criptografado = models.CharField(max_length=200, blank=True, null=True, verbose_name=_("CVV (Criptografado)"))
    data_inicio = models.DateField(auto_now_add=True, verbose_name=_("Data de Início"))
    proxima_cobranca = models.DateField(null=True, blank=True, verbose_name=_("Próxima Cobrança"))

    def __str__(self):
        return f"Assinatura de {self.usuario.nome_usuario} ({self.plano} - {self.tipo_plano})"

    def criptografar_dados_cartao(self, numero_cartao, nome_cartao, validade, cvv):
        if not all([numero_cartao, nome_cartao, validade, cvv]):
            raise ValueError("Todos os campos do cartão devem ser fornecidos.")

        fernet = Fernet(settings.ENCRYPTION_KEY)

        self.numero_cartao_criptografado = fernet.encrypt(numero_cartao.encode()).decode()
        self.nome_cartao_criptografado = fernet.encrypt(nome_cartao.encode()).decode()
        self.validade_criptografada = fernet.encrypt(validade.encode()).decode()
        self.cvv_criptografado = fernet.encrypt(cvv.encode()).decode()

    def descriptografar_numero_cartao(self):
        if not self.numero_cartao_criptografado:
            return None
        fernet = Fernet(settings.ENCRYPTION_KEY)
        return fernet.decrypt(self.numero_cartao_criptografado.encode()).decode()

    def descriptografar_nome_cartao(self):
        if not self.nome_cartao_criptografado:
            return None
        fernet = Fernet(settings.ENCRYPTION_KEY)
        return fernet.decrypt(self.nome_cartao_criptografado.encode()).decode()

    def descriptografar_validade(self):
        if not self.validade_criptografada:
            return None
        fernet = Fernet(settings.ENCRYPTION_KEY)
        return fernet.decrypt(self.validade_criptografada.encode()).decode()

    def descriptografar_cvv(self):
        if not self.cvv_criptografado:
            return None
        fernet = Fernet(settings.ENCRYPTION_KEY)
        return fernet.decrypt(self.cvv_criptografado.encode()).decode()
    



class Dispositivo(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    sistema_operacional = models.CharField(max_length=80)  
    navegador = models.CharField(max_length=50, blank=True, null=True)
    ultima_data_login = models.DateField(auto_now=True)  
    ip = models.CharField(max_length=50, blank=True, null=True)
    pais = models.CharField(max_length=50, blank=True, null=True, default="BR")
    via_app = models.BooleanField(default=False)  # Indica se foi login pelo app

    def save(self, *args, **kwargs):
        # Definir o país como "BR"
        self.pais = "BR"

        # Mapear o sistema operacional
        sistema = self.sistema_operacional.lower()
        if "windows" in sistema:
            self.sistema_operacional = "Windows"
        elif "android" in sistema:
            self.sistema_operacional = "Android"
        elif "mac os" in sistema or "macintosh" in sistema:
            self.sistema_operacional = "macOS"
        elif "linux" in sistema:
            self.sistema_operacional = "Linux"
        else:
            self.sistema_operacional = "Desconhecido"

        # Verificar se o navegador é mobile
        if self.navegador and "Mobile" in self.navegador:
            self.via_app = True
        else:
            self.via_app = False

        # Evitar duplicação
        dispositivo_existente = Dispositivo.objects.filter(
            usuario=self.usuario,
            sistema_operacional=self.sistema_operacional,
            navegador=self.navegador
        ).first()

        if dispositivo_existente:
            # Atualizar a última data de login sem chamar save novamente
            Dispositivo.objects.filter(id=dispositivo_existente.id).update(ultima_data_login=self.ultima_data_login)
        else:
            super().save(*args, **kwargs)