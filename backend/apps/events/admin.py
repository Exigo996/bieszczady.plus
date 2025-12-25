from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from .models import Event, Organizer


@admin.register(Organizer)
class OrganizerAdmin(admin.ModelAdmin):
    """Admin interface for Organizer model"""

    list_display = [
        'name',
        'is_active',
        'facebook_link',
        'created_at',
    ]

    list_filter = [
        'is_active',
        'created_at',
    ]

    search_fields = [
        'name',
        'description',
        'facebook_link',
    ]

    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Media', {
            'fields': ('image', 'logo')
        }),
        ('Linki zewnętrzne', {
            'fields': ('facebook_link', 'ticketing_site', 'website')
        }),
        ('Metadane', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Event)
class EventAdmin(GISModelAdmin):
    """Admin interface for Event model with PostGIS map widget"""

    list_display = [
        'get_title_pl',
        'category',
        'event_type',
        'start_date',
        'location_name',
        'price_type',
        'moderation_status',
        'source'
    ]

    list_filter = [
        'category',
        'event_type',
        'price_type',
        'moderation_status',
        'source',
        'start_date',
    ]

    search_fields = [
        'location_name',
        'organizer_name',
        'facebook_event_id'
    ]

    readonly_fields = ['created_at', 'updated_at', 'slug']

    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('title', 'slug', 'description', 'category', 'event_type')
        }),
        ('Data i czas', {
            'fields': ('start_date', 'end_date', 'duration_minutes')
        }),
        ('Lokalizacja', {
            'fields': ('location_name', 'coordinates', 'address'),
            'description': 'Użyj mapy, aby ustawić współrzędne'
        }),
        ('Cennik', {
            'fields': ('price_type', 'price_amount', 'currency')
        }),
        ('Organizator', {
            'fields': ('organizer', 'organizer_name', 'organizer_contact', 'age_restriction')
        }),
        ('Linki zewnętrzne', {
            'fields': ('external_url', 'ticket_url', 'facebook_event_id')
        }),
        ('Media', {
            'fields': ('image', 'images')
        }),
        ('Moderacja', {
            'fields': ('source', 'moderation_status', 'moderation_notes')
        }),
        ('Metadane', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    # PostGIS map widget
    map_template = 'gis/admin/openlayers.html'
    default_lon = 2523000  # Longitude for Bieszczady region (EPSG:3857)
    default_lat = 6335000  # Latitude for Bieszczady region (EPSG:3857)
    default_zoom = 10

    def get_title_pl(self, obj):
        """Display Polish title in admin list"""
        return obj.title.get('pl', 'Brak tytułu')
    get_title_pl.short_description = 'Tytuł'

    def get_queryset(self, request):
        """Optimize queryset with select_related if needed"""
        qs = super().get_queryset(request)
        return qs
