from rest_framework import serializers
from .models import Event, Organizer, EventDate, Location


class LocationSerializer(serializers.ModelSerializer):
    """Serializer for Location model"""
    class Meta:
        model = Location
        fields = [
            'id',
            'name',
            'shortname',
            'city',
            'address',
            'latitude',
            'longitude',
            'google_maps_url',
            'website',
            'phone',
            'email',
            'capacity',
            'location_type',
            'amenities',
            'description',
            'is_active',
        ]


class TranslatedField(serializers.DictField):
    """Base field for translated content with language filtering"""

    def __init__(self, *args, **kwargs):
        self.fields = kwargs.pop('fields', [])
        super().__init__(*args, **kwargs)

    def to_representation(self, value):
        if not value:
            return {}

        # value is a dict with pl, en, uk keys from the model's @property
        data = {
            'pl': value.get('pl', ''),
            'en': value.get('en', ''),
            'uk': value.get('uk', ''),
        }

        # Filter by language if specified in query params
        request = self.context.get('request')
        if request:
            lang = request.query_params.get('lang', '').lower()
            if lang in ('pl', 'en', 'uk'):
                return {lang: data.get(lang, '')}
        return data

    def get_attribute(self, obj):
        # Get all language versions from model
        return {
            'pl': getattr(obj, f'{self.field_name}_pl', ''),
            'en': getattr(obj, f'{self.field_name}_en', ''),
            'uk': getattr(obj, f'{self.field_name}_uk', ''),
        }


class EventImageField(serializers.Field):
    """Returns event images as array of URLs from Gallery"""

    def to_representation(self, obj):
        # obj is the Event instance
        images = []
        for event_image in obj.event_images.select_related('image').order_by('order'):
            image = event_image.image
            images.append({
                'id': image.id,
                'url': image.image.url if image.image else None,
                'title': image.title,
                'is_main': event_image.is_main,
                'order': event_image.order,
            })
        return images

    def get_attribute(self, obj):
        # Return the Event instance itself
        return obj


class EventSerializer(serializers.ModelSerializer):
    """
    Standard serializer for Event model
    Includes all fields with proper handling of translated fields and location

    Language filtering: Add ?lang=pl|en|uk to query params to get only that language
    """
    # Add computed fields
    is_past = serializers.ReadOnlyField()
    is_free = serializers.ReadOnlyField()

    # Group language fields into nested structure for frontend
    title = TranslatedField(read_only=True)
    description = TranslatedField(read_only=True)

    # Nested location
    location = LocationSerializer(read_only=True)

    # Coordinates as separate lat/lng for easier frontend consumption
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    # Images from Gallery
    images = EventImageField(read_only=True)

    # Dates with their locations
    event_dates = EventDateSerializer(many=True, read_only=True)

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
            'location',
            'latitude',
            'longitude',
            'price_type',
            'price_amount',
            'currency',
            'age_restriction',
            'external_url',
            'ticket_url',
            'images',
            'event_dates',
            'source',
            'moderation_status',
            'created_at',
            'updated_at',
            'is_past',
            'is_free',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'is_past', 'is_free']

    def get_latitude(self, obj):
        """Extract latitude from location"""
        if obj.location and obj.location.latitude:
            return float(obj.location.latitude)
        return None

    def get_longitude(self, obj):
        """Extract longitude from location"""
        if obj.location and obj.location.longitude:
            return float(obj.location.longitude)
        return None


class EventListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for event listings
    Only includes essential fields for better performance

    Language filtering: Add ?lang=pl|en|uk to query params to get only that language
    """
    is_free = serializers.ReadOnlyField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    # Group language fields into nested structure for frontend
    title = TranslatedField(read_only=True)

    # Simplified location info for list
    location_name = serializers.SerializerMethodField()
    location_city = serializers.SerializerMethodField()

    # Main image URL for list view
    image = serializers.SerializerMethodField()

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
            'location_city',
            'latitude',
            'longitude',
            'price_type',
            'price_amount',
            'currency',
            'image',
            'is_free',
        ]

    def get_latitude(self, obj):
        if obj.location and obj.location.latitude:
            return float(obj.location.latitude)
        return None

    def get_longitude(self, obj):
        if obj.location and obj.location.longitude:
            return float(obj.location.longitude)
        return None

    def get_location_name(self, obj):
        """Get location name for list display"""
        return obj.location.name if obj.location else None

    def get_location_city(self, obj):
        """Get location city for list display"""
        return obj.location.city if obj.location else None

    def get_image(self, obj):
        """Get main image URL for list display"""
        main = obj.main_image
        if main and main.image:
            return main.image.url
        return None


class OrganizerSerializer(serializers.ModelSerializer):
    """
    Serializer for Organizer model
    Includes event count and upcoming events info
    """
    events_count = serializers.SerializerMethodField()
    upcoming_events_count = serializers.SerializerMethodField()

    class Meta:
        model = Organizer
        fields = [
            'id',
            'name',
            'shortname',
            'description',
            'image',
            'logo',
            'facebook_link',
            'ticketing_site',
            'website',
            'is_active',
            'events_count',
            'upcoming_events_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'events_count', 'upcoming_events_count']

    def get_events_count(self, obj):
        """Get total number of events for this organizer"""
        return obj.events.count()

    def get_upcoming_events_count(self, obj):
        """Get count of upcoming events"""
        from django.utils import timezone
        return obj.events.filter(start_date__gte=timezone.now()).count()


class OrganizerListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for organizer listings
    Only includes essential fields for better performance
    """
    events_count = serializers.SerializerMethodField()

    class Meta:
        model = Organizer
        fields = [
            'id',
            'name',
            'shortname',
            'logo',
            'is_active',
            'events_count',
        ]

    def get_events_count(self, obj):
        """Get total number of events for this organizer"""
        return obj.events.count()


class EventDateSerializer(serializers.ModelSerializer):
    """
    Serializer for EventDate model
    Includes nested location for each date
    """
    is_past = serializers.ReadOnlyField()
    location = LocationSerializer(read_only=True)

    class Meta:
        model = EventDate
        fields = [
            'id',
            'start_date',
            'end_date',
            'duration_minutes',
            'notes',
            'is_past',
            'location',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_past']
