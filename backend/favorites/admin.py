from django.contrib import admin

from .models import Favorite


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ["user", "recipe_name", "recipe_id", "created_at"]
    list_filter = ["created_at"]
    search_fields = ["user__email", "recipe_name"]
    raw_id_fields = ["user"]
