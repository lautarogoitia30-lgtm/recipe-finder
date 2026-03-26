from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_root(request):
    return JsonResponse({"status": "ok", "message": "Recipe Finder API"})


urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/recipes/", include("recipes.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/favorites/", include("favorites.urls")),
]
