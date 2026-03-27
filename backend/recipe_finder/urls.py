from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.generic import TemplateView


def api_root(request):
    return JsonResponse({"status": "ok", "message": "Recipe Finder API"})


urlpatterns = [
    path("api/recipes/", include("recipes.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/favorites/", include("favorites.urls")),
    path("admin/", admin.site.urls),
]

# Serve React SPA for all other routes
urlpatterns += [
    re_path(r"^(?!api/|admin/|static/).*", TemplateView.as_view(template_name="frontend/index.html")),
]
