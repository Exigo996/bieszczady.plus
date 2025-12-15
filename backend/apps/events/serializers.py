from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """
    Standard serializer for Event model
    Includes all fields with proper handling of JSONField and coordinates
    """
    # Add computed fields
    is_past = serializers.ReadOnlyField()
    is_free = serializers.ReadOnlyField()

    # Coordinates as separate lat/lng for easier frontend consumption
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'category',
            'event_type',
            'start_date',
            'end_date',
            'duration_minutes',
            'location_name',
            'coordinates',
            'latitude',
            'longitude',
            'address',
            'price_type',
            'price_amount',
            'currency',
            'age_restriction',
            'organizer_name',
            'organizer_contact',
            'external_url',
            'ticket_url',
            'image',
            'images',
            'source',
            'moderation_status',
            'created_at',
            'updated_at',
            'is_past',
            'is_free',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'is_past', 'is_free']

    def get_latitude(self, obj):
        """Extract latitude from Point field"""
        if obj.coordinates:
            return obj.coordinates.y
        return None

    def get_longitude(self, obj):
        """Extract longitude from Point field"""
        if obj.coordinates:
            return obj.coordinates.x
        return None


class EventListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for event listings
    Only includes essential fields for better performance
    """
    is_free = serializers.ReadOnlyField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'slug',
            'category',
            'event_type',
            'start_date',
            'end_date',
            'location_name',
            'latitude',
            'longitude',
            'price_type',
            'price_amount',
            'currency',
            'image',
            'is_free',
        ]

    def get_latitude(self, obj):
        if obj.coordinates:
            return obj.coordinates.y
        return None

    def get_longitude(self, obj):
        if obj.coordinates:
            return obj.coordinates.x
        return None


class EventGeoJSONSerializer(GeoFeatureModelSerializer):
    """
    GeoJSON serializer for map display
    Returns events in GeoJSON format for Leaflet/Mapbox
    """
    class Meta:
        model = Event
        geo_field = 'coordinates'
        fields = [
            'id',
            'title',
            'slug',
            'category',
            'event_type',
            'start_date',
            'location_name',
            'price_type',
            'image',
        ]
