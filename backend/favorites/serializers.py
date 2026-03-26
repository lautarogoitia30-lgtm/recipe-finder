from rest_framework import serializers

from .models import Favorite


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ["id", "recipe_id", "recipe_name", "recipe_thumb", "created_at"]
        read_only_fields = ["id", "created_at"]


class FavoriteCreateSerializer(serializers.Serializer):
    recipe_id = serializers.CharField(max_length=10)
    recipe_name = serializers.CharField(max_length=200)
    recipe_thumb = serializers.URLField(required=False, allow_blank=True, default="")

    def validate_recipe_id(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("Recipe ID must be numeric.")
        return value

    def validate_recipe_name(self, value):
        import re

        return re.sub(r"<[^>]+>", "", value).strip()

    def validate(self, attrs):
        user = self.context["request"].user
        if Favorite.objects.filter(user=user, recipe_id=attrs["recipe_id"]).exists():
            raise serializers.ValidationError("Recipe is already in favorites.")
        return attrs
