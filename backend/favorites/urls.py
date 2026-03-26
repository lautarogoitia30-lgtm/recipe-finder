from django.urls import path
from . import views

app_name = "favorites"

urlpatterns = [
    path("", views.list_favorites, name="list"),
    path("add/", views.add_favorite, name="add"),
    path("remove/<str:recipe_id>/", views.remove_favorite, name="remove"),
    path("check/<str:recipe_id>/", views.check_favorite, name="check"),
]
