# Generated by Django 5.1.6 on 2025-03-31 13:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spacemusic', '0015_auto_20250317_1439'),
    ]

    operations = [
        migrations.AlterField(
            model_name='musica',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
