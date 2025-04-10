# contas/forms.py
from django import forms
from .models import Usuario

class CustomPasswordResetForm(forms.Form):
    email = forms.EmailField(label="Email")

    def clean_email(self):
        email = self.cleaned_data['email']
        # Verificar se o email existe no banco de dados
        if not Usuario.objects.filter(email=email).exists():
            raise forms.ValidationError("Este email não está cadastrado.")
        return email