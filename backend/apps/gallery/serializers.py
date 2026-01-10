from rest_framework import serializers
from .models import Image


class ImageSerializer(serializers.ModelSerializer):
    """
    Full serializer for Image model
    Includes all fields for create/update/retrieve operations
    """
    class Meta:
        model = Image
        fields = [
            'id',
            'title',
            'description',
            'image',
            'tags',
            'file_size',
            'width',
            'height',
            'uploaded_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'file_size',
            'width',
            'height',
            'uploaded_at',
            'updated_at',
        ]

    def validate_tags(self, value):
        """Ensure tags is a list of strings"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list")

        # Ensure all tags are strings
        for tag in value:
            if not isinstance(tag, str):
                raise serializers.ValidationError("All tags must be strings")

        # Remove empty tags
        value = [tag.strip() for tag in value if tag.strip()]

        return value


class ImageListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for image listings
    Only includes essential fields for better performance
    """
    class Meta:
        model = Image
        fields = [
            'id',
            'title',
            'image',
            'tags',
            'uploaded_at',
        ]
