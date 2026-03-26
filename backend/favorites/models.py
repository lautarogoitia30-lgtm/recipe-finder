from django.conf import settings
from django.db import models


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites",
    )
    recipe_id = models.CharField(max_length=10)
    recipe_name = models.CharField(max_length=200)
    recipe_thumb = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "recipe_id")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} → {self.recipe_name}"
