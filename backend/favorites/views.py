from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Favorite
from .serializers import FavoriteCreateSerializer, FavoriteSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_favorites(request):
    """List all favorites for the authenticated user."""
    favorites = Favorite.objects.filter(user=request.user)
    serializer = FavoriteSerializer(favorites, many=True)
    return Response({"favorites": serializer.data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_favorite(request):
    """Add a recipe to favorites."""
    serializer = FavoriteCreateSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)

    favorite = Favorite.objects.create(
        user=request.user,
        recipe_id=serializer.validated_data["recipe_id"],
        recipe_name=serializer.validated_data["recipe_name"],
        recipe_thumb=serializer.validated_data.get("recipe_thumb", ""),
    )

    return Response(
        FavoriteSerializer(favorite).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_favorite(request, recipe_id):
    """Remove a recipe from favorites."""
    if not recipe_id.isdigit():
        return Response(
            {"error": "Invalid recipe ID."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    deleted, _ = Favorite.objects.filter(
        user=request.user, recipe_id=recipe_id
    ).delete()

    if deleted:
        return Response({"message": "Removed from favorites."})
    return Response(
        {"error": "Recipe not in favorites."},
        status=status.HTTP_404_NOT_FOUND,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_favorite(request, recipe_id):
    """Check if a recipe is in user's favorites."""
    if not recipe_id.isdigit():
        return Response(
            {"error": "Invalid recipe ID."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    is_favorited = Favorite.objects.filter(
        user=request.user, recipe_id=recipe_id
    ).exists()

    return Response({"is_favorited": is_favorited})
