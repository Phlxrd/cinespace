from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from .models import Usuario

class UsuarioForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        label="Email",
        widget=forms.EmailInput(attrs={'placeholder': 'Digite seu email'}),
    )
    nome_usuario = forms.CharField(
        max_length=150,
        required=True,
        label="Nome de Usuário",
        widget=forms.TextInput(attrs={'placeholder': 'Escolha um nome de usuário'}),
    )
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Crie uma senha'}),
        label="Senha",
        strip=False,
        help_text="Sua senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.",
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Repita a senha'}),
        label="Confirmação de Senha",
        strip=False,
        help_text="Digite a mesma senha acima para confirmação.",
    )

    class Meta:
        model = Usuario
        fields = ['nome_usuario', 'email', 'password1', 'password2']

    def clean_password1(self):
        password = self.cleaned_data.get("password1")
        if len(password) < 8:
            raise ValidationError("A senha deve ter pelo menos 8 caracteres.")
        if not any(char.islower() for char in password):
            raise ValidationError("A senha deve conter pelo menos uma letra minúscula.")
        if not any(char.isupper() for char in password):
            raise ValidationError("A senha deve conter pelo menos uma letra maiúscula.")
        if not any(char.isdigit() for char in password):
            raise ValidationError("A senha deve conter pelo menos um número.")
        if not any(char in "!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?`~" for char in password):
            raise ValidationError("A senha deve conter pelo menos um caractere especial.")
        return password

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            self.add_error('password2', "As senhas não coincidem.")

        return cleaned_data
