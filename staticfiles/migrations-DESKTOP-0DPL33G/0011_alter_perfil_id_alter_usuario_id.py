# Generated by Django 5.1.2 on 2025-02-14 14:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contas', '0010_auto_20250213_1326'),
    ]

    operations = [
        migrations.AlterField(
            model_name='perfil',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='usuario',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
