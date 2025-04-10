# Generated by Django 5.1.2 on 2025-02-16 17:25

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contas', '0005_alter_assinatura_id_alter_perfil_id_alter_usuario_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='Dispositivo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=255)),
                ('ultimo_acesso', models.DateTimeField(auto_now=True)),
                ('ip', models.GenericIPAddressField(blank=True, null=True)),
                ('pais', models.CharField(blank=True, max_length=3, null=True)),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dispositivos', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
