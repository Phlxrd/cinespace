# Generated by Django 5.1.6 on 2025-03-09 15:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spacemusic', '0003_alter_musica_arquivo_alter_musica_capa'),
    ]

    operations = [
        migrations.AddField(
            model_name='musica',
            name='album',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
