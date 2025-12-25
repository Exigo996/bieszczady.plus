from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from .models import Event, EventDate, Organizer


class EventDateInline(admin.TabularInline):
    """Inline admin for EventDate model"""
    model = EventDate
    extra = 1
    fields = ['start_date', 'end_date', 'duration_minutes', 'notes']
    ordering = ['start_date']


@admin.register(EventDate)
class EventDateAdmin(admin.ModelAdmin):
    """Admin interface for EventDate model"""

    list_display = [
        'event',
        'start_date',
        'end_date',
        'duration_minutes',
        'is_past',
    ]

    list_filter = [
        'start_date',
        'created_at',
    ]

    search_fields = [
        'event__title',
        'notes',
    ]

    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Wydarzenie', {
            'fields': ('event',)
        }),
        ('Data i czas', {
            'fields': ('start_date', 'end_date', 'duration_minutes', 'notes')
        }),
        ('Metadane', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Organizer)
class OrganizerAdmin(admin.ModelAdmin):
    """Admin interface for Organizer model"""

    list_display = [
        'name',
        'shortname',
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
        'shortname',
        'description',
        'facebook_link',
    ]

    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('name', 'shortname', 'description', 'is_active')
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
        'get_next_date',
        'get_dates_count',
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

    # Add inline for EventDate
    inlines = [EventDateInline]

    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('title', 'slug', 'description', 'category', 'event_type')
        }),
        ('Data i czas (STARE - użyj sekcji "Terminy wydarzeń" poniżej)', {
            'fields': ('start_date', 'end_date', 'duration_minutes'),
            'classes': ('collapse',),
            'description': 'PRZESTARZAŁE: Dodaj daty używając sekcji "Terminy wydarzeń" poniżej'
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

    def get_next_date(self, obj):
        """Display next event date"""
        next_date = obj.next_date
        if next_date:
            return next_date.start_date.strftime('%Y-%m-%d %H:%M')
        elif obj.start_date:
            return obj.start_date.strftime('%Y-%m-%d %H:%M')
        return '-'
    get_next_date.short_description = 'Najbliższa data'

    def get_dates_count(self, obj):
        """Display count of event dates"""
        count = obj.event_dates.count()
        return f"{count} terminów" if count > 0 else '-'
    get_dates_count.short_description = 'Liczba terminów'

    def get_queryset(self, request):
        """Optimize queryset with prefetch_related for event_dates"""
        qs = super().get_queryset(request)
        return qs.prefetch_related('event_dates', 'organizer')
