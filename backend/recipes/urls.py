from django.urls import path
from . import views

app_name = "recipes"

urlpatterns = [
    path("health/", views.health_check, name="health"),
    path("search/", views.search_recipes, name="search"),
    path("filter/", views.filter_recipes, name="filter"),
    path("recipes/<str:recipe_id>/", views.get_recipe_detail, name="recipe-detail"),
    path("categories/", views.list_categories, name="categories"),
    path("ingredients/", views.list_ingredients, name="ingredients"),
    path("areas/", views.list_areas, name="areas"),
    path("random/", views.random_recipe, name="random"),
]
