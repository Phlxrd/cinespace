from django.db import models
from contas.models import Perfil
from pesquisa.models import Midia

class Progresso(models.Model):
    perfil = models.ForeignKey(Perfil, on_delete=models.CASCADE)
    midia = models.ForeignKey(Midia, on_delete=models.CASCADE)
    episodio_numero = models.IntegerField(default=0)
    current_time = models.FloatField(default=0)

    class Meta:
        unique_together = ('perfil', 'midia', 'episodio_numero')

    def __str__(self):
        return f"Progresso: {self.perfil} - {self.midia} - Episódio {self.episodio_numero}"