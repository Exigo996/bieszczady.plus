from django.contrib import admin
from django.shortcuts import render
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse, path
from django.utils.safestring import mark_safe

from .models import Event, EventDate, Organizer, EventImage, Location
from .services import EventImporter
from .views import import_events_json


class EventDateInline(admin.TabularInline):
    """Inline admin for EventDate model"""
    model = EventDate
    extra = 1
    fields = ['start_date', 'end_date', 'location', 'duration_minutes', 'notes']
    ordering = ['start_date']


class EventImageInline(admin.TabularInline):
    """Inline admin for EventImage model - manage event images"""
    model = EventImage
    extra = 1
    fields = ['image', 'order', 'is_main']
    ordering = ['order']


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    """Admin interface for Location model"""
    list_display = ['name', 'city', 'shortname', 'location_type', 'is_active']
    list_filter = ['location_type', 'is_active', 'city']
    search_fields = ['name', 'shortname', 'city', 'address']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('name', 'shortname', 'location_type', 'is_active')
        }),
        ('Adres', {
            'fields': ('city', 'address')
        }),
        ('Współrzędne', {
            'fields': ('latitude', 'longitude', 'google_maps_url'),
            'description': 'Wpisz współrzędne ręcznie lub wklej link Google Maps'
        }),
        ('Kontakt', {
            'fields': ('website', 'phone', 'email')
        }),
        ('Dodatkowe informacje', {
            'fields': ('capacity', 'amenities', 'description')
        }),
        ('Metadane', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EventDate)
class EventDateAdmin(admin.ModelAdmin):
    """Admin interface for EventDate model"""

    list_display = [
        'event',
        'start_date',
        'get_location',
        'end_date',
        'duration_minutes',
        'is_past',
    ]

    list_filter = [
        'start_date',
        'location',
        'created_at',
    ]

    search_fields = [
        'event__title_pl',
        'location__name',
        'notes',
    ]

    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Wydarzenie', {
            'fields': ('event', 'location')
        }),
        ('Data i czas', {
            'fields': ('start_date', 'end_date', 'duration_minutes', 'notes')
        }),
        ('Metadane', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_location(self, obj):
        """Display location in admin list"""
        if obj.location:
            return f"{obj.location.name} ({obj.location.city})" if obj.location.city else obj.location.name
        return '-'
    get_location.short_description = 'Lokalizacja'


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


@admin.register(EventImage)
class EventImageAdmin(admin.ModelAdmin):
    """Admin interface for EventImage model"""
    list_display = ['event', 'image', 'order', 'is_main']
    list_filter = ['is_main', 'order']
    search_fields = ['event__title_pl', 'image__title']
    ordering = ['event', 'order']


def import_events_from_json(modeladmin, request, queryset):
    """
    Admin action to import events from JSON file.
    Redirects to intermediate view with file upload form.
    """
    # Store selected IDs in session for returning after import
    selected = request.POST.getlist(admin.ACTION_CHECKBOX_NAME)
    request.session['_selected_events'] = selected
    return HttpResponseRedirect(reverse('admin:events_event_import_json'))


import_events_from_json.short_description = 'Importuj wydarzenia z pliku JSON'


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Admin interface for Event model"""

    actions = [import_events_from_json]

    list_display = [
        'title_pl',
        'category',
        'event_type',
        'get_location',
        'get_next_date',
        'get_dates_count',
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
        'location',
        'start_date',
    ]

    search_fields = [
        'title_pl',
        'title_en',
        'title_uk',
        'location__name',
        'location__city',
        'organizer__name',
        'facebook_event_id'
    ]

    readonly_fields = ['created_at', 'updated_at', 'slug']

    # Add inlines for EventDate and EventImage
    inlines = [EventDateInline, EventImageInline]

    fieldsets = (
        ('Podstawowe informacje', {
            'fields': (
                'title_pl',
                'title_en',
                'title_uk',
                'description_pl',
                'description_en',
                'description_uk',
                'category',
                'event_type'
            )
        }),
        ('Lokalizacja i Organizator', {
            'fields': ('location', 'organizer')
        }),
        ('Data i czas (STARE - użyj sekcji "Terminy wydarzeń" poniżej)', {
            'fields': ('start_date', 'end_date', 'duration_minutes'),
            'classes': ('collapse',),
            'description': 'PRZESTARZAŁE: Dodaj daty używając sekcji "Terminy wydarzeń" poniżej'
        }),
        ('Cennik', {
            'fields': ('price_type', 'price_amount', 'currency')
        }),
        ('Organizator', {
            'fields': ('age_restriction',)
        }),
        ('Linki zewnętrzne', {
            'fields': ('external_url', 'ticket_url', 'facebook_event_id')
        }),
        ('Moderacja', {
            'fields': ('source', 'moderation_status', 'moderation_notes')
        }),
        ('Metadane', {
            'fields': ('slug', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_location(self, obj):
        """Display location in admin list"""
        if obj.location:
            return f"{obj.location.name} ({obj.location.city})" if obj.location.city else obj.location.name
        return '-'
    get_location.short_description = 'Lokalizacja'

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
        """Optimize queryset with prefetch_related"""
        qs = super().get_queryset(request)
        return qs.select_related('location', 'organizer').prefetch_related(
            'event_dates', 'event_images__image'
        )

    def get_urls(self):
        """Add custom URL for import view"""
        urls = super().get_urls()
        custom_urls = [
            path(
                'import/json/',
                self.admin_site.admin_view(import_events_json),
                name='events_event_import_json'
            ),
        ]
        return custom_urls + urls
