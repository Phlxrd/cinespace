# Generated by Django 3.0 on 2025-02-14 17:09

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Ator',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(default='Nome Indefinido', max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Genero',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=15, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Midia',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(default='Título Indefinido', max_length=255)),
                ('tipo', models.CharField(choices=[('filme', 'Filme'), ('serie', 'Série')], default='filme', max_length=10)),
                ('image_url', models.URLField(default='sem_img')),
                ('url', models.URLField(default='sem_url')),
                ('temporadas', models.IntegerField(blank=True, null=True)),
                ('ano', models.IntegerField(blank=True, null=True)),
                ('classificacao', models.FloatField(blank=True, null=True)),
                ('duracao', models.CharField(blank=True, max_length=20, null=True)),
                ('descricao', models.TextField(blank=True, null=True)),
                ('categoria', models.CharField(blank=True, max_length=50, null=True)),
                ('classificacao_idade', models.CharField(blank=True, choices=[('L', 'Livre'), ('10', '10+'), ('12', '12+'), ('14', '14+'), ('16', '16+'), ('18', '18+')], default='L', max_length=3, null=True)),
                ('atores', models.ManyToManyField(blank=True, to='pesquisa.Ator')),
                ('generos', models.ManyToManyField(blank=True, to='pesquisa.Genero')),
            ],
        ),
    ]
