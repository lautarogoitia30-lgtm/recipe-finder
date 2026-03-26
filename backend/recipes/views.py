import logging
import re
import time

import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def sanitize_query(value):
    """Strip HTML tags and limit length."""
    value = re.sub(r"<[^>]+>", "", value)
    return value.strip()[:100]


def fetch_from_api(endpoint, params=None, cache_key=None, cache_ttl=300):
    """
    Helper to fetch from TheMealDB with caching and error handling.
    Returns (data, error_response) tuple.
    """
    # 1. Try cache first
    if cache_key:
        cached = cache.get(cache_key)
        if cached:
            return cached, None

    # 2. Try API (2 attempts)
    url = f"{settings.THEMEALDB_API_URL}/{endpoint}"
    data = None

    for attempt in range(2):
        try:
            resp = requests.get(url, params=params, timeout=12)
            resp.raise_for_status()
            data = resp.json()
            break  # Success, exit loop
        except Exception as e:
            logger.warning("API attempt %d failed for %s: %s", attempt + 1, endpoint, e)
            if attempt == 0:
                time.sleep(0.3)  # Short wait before retry

    # 3. If API failed, try stale cache
    if data is None and cache_key:
        stale = cache.get(f"stale:{cache_key}")
        if stale:
            logger.info("Using stale cache for %s", cache_key)
            return stale, None

    # 4. If completely failed
    if data is None:
        return None, Response(
            {"error": "No se pudieron cargar las recetas. Intentá de nuevo."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # 5. Cache successful response
    if cache_key:
        cache.set(cache_key, data, cache_ttl)
        cache.set(f"stale:{cache_key}", data, cache_ttl * 4)

    return data, None


# Health check endpoint
@api_view(["GET"])
def health_check(request):
    """Simple health check."""
    return Response({"status": "ok"})


@api_view(["GET"])
def search_recipes(request):
    """Search recipes by name or first letter."""
    try:
        query = sanitize_query(request.query_params.get("q", ""))
        letter = sanitize_query(request.query_params.get("letter", ""))

        if not query and not letter:
            return Response(
                {"error": "Proporcioná un parámetro de búsqueda"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if query:
            data, err = fetch_from_api(
                "search.php", params={"s": query}, cache_key=f"search:{query}"
            )
        else:
            data, err = fetch_from_api(
                "search.php", params={"f": letter[0]}, cache_key=f"search:letter:{letter[0]}"
            )

        if err:
            return err

        meals = data.get("meals") or []
        return Response({"meals": meals})
    except Exception as e:
        logger.error("search_recipes error: %s", e)
        return Response(
            {"meals": [], "error": "Error al buscar recetas"},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
def get_recipe_detail(request, recipe_id):
    """Get full recipe details by ID."""
    try:
        if not recipe_id.isdigit():
            return Response(
                {"error": "ID de receta inválido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data, err = fetch_from_api(
            "lookup.php", params={"i": recipe_id}, cache_key=f"recipe:{recipe_id}", cache_ttl=600
        )
        if err:
            return err

        meals = data.get("meals")
        if not meals:
            return Response(
                {"error": "Receta no encontrada"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({"recipe": meals[0]})
    except Exception as e:
        logger.error("get_recipe_detail error: %s", e)
        return Response(
            {"error": "No se pudo cargar la receta"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def list_categories(request):
    """List all recipe categories."""
    try:
        data, err = fetch_from_api("categories.php", cache_key="categories", cache_ttl=3600)
        if err:
            return err

        categories = data.get("categories", [])
        return Response({"categories": categories})
    except Exception as e:
        logger.error("list_categories error: %s", e)
        return Response(
            {"categories": [], "error": "Error al cargar categorías"},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
def random_recipe(request):
    """Get a random recipe."""
    try:
        data, err = fetch_from_api("random.php")
        if err:
            return err

        meals = data.get("meals")
        if not meals:
            return Response(
                {"error": "No hay recetas disponibles"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({"recipe": meals[0]})
    except Exception as e:
        logger.error("random_recipe error: %s", e)
        return Response(
            {"error": "No se pudo cargar la receta"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def filter_recipes(request):
    """Filter recipes by ingredient, category, or area."""
    try:
        ingredient = sanitize_query(request.query_params.get("i", ""))
        category = sanitize_query(request.query_params.get("c", ""))
        area = sanitize_query(request.query_params.get("a", ""))

        filters = {"i": ingredient, "c": category, "a": area}
        active = {k: v for k, v in filters.items() if v}

        if not active:
            return Response(
                {"error": "Proporcioná al menos un filtro"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        filter_key, filter_value = next(iter(active.items()))
        cache_key = f"filter:{filter_key}:{filter_value}"

        data, err = fetch_from_api(
            "filter.php", params={filter_key: filter_value}, cache_key=cache_key, cache_ttl=300
        )
        if err:
            return err

        meals = data.get("meals") or []
        return Response({"meals": meals, "filter": active})
    except Exception as e:
        logger.error("filter_recipes error: %s", e)
        return Response(
            {"meals": [], "error": "Error al filtrar recetas"},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
def list_ingredients(request):
    """List all available ingredients."""
    try:
        data, err = fetch_from_api("list.php", params={"i": "list"}, cache_key="ingredients", cache_ttl=3600)
        if err:
            return err

        ingredients = data.get("meals", [])
        return Response({"ingredients": ingredients})
    except Exception as e:
        logger.error("list_ingredients error: %s", e)
        return Response(
            {"ingredients": [], "error": "Error al cargar ingredientes"},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
def list_areas(request):
    """List all available cuisine areas."""
    try:
        data, err = fetch_from_api("list.php", params={"a": "list"}, cache_key="areas", cache_ttl=3600)
        if err:
            return err

        areas = data.get("meals", [])
        return Response({"areas": areas})
    except Exception as e:
        logger.error("list_areas error: %s", e)
        return Response(
            {"areas": [], "error": "Error al cargar cocinas"},
            status=status.HTTP_200_OK,
        )
