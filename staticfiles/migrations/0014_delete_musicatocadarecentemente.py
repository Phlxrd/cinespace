# Generated by Django 5.1.6 on 2025-03-12 13:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('spacemusic', '0013_alter_musica_id_musicatocadarecentemente'),
    ]

    operations = [
        migrations.DeleteModel(
            name='MusicaTocadaRecentemente',
        ),
    ]
