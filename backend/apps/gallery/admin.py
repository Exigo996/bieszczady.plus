from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Q

from .models import Image


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    """
    Admin interface for Image model with tag autocomplete widget
    """
    list_display = [
        'title',
        'image_thumbnail',
        'get_tags',
        'uploaded_at',
        'file_size_formatted'
    ]
    list_filter = ['uploaded_at', 'tags']
    search_fields = ['title', 'description', 'tags']
    readonly_fields = [
        'uploaded_at',
        'updated_at',
        'file_size',
        'width',
        'height',
        'image_preview'
    ]
    filter_horizontal = ()  # We'll use custom widget for tags instead

    # Organize fieldsets for better UX
    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('title', 'description')
        }),
        ('Obraz', {
            'fields': ('image', 'image_preview')
        }),
        ('Tagi', {
            'fields': ('tags_with_autocomplete',),
            'description': 'Wprowadź tagi oddzielone przecinkami. Użyj istniejących tagów lub dodaj nowe.'
        }),
        ('Metadane', {
            'fields': ('file_size', 'width', 'height', 'uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        """Show image preview in detail view"""
        if obj.image and obj.image.url:
            return format_html(
                '<img src="{}" style="max-width: 600px; max-height: 400px; object-fit: contain;" />',
                obj.image.url
            )
        return "Brak obrazu"
    image_preview.short_description = 'Podgląd'

    def image_thumbnail(self, obj):
        """Show small thumbnail in list view"""
        if obj.image and obj.image.url:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "Brak"
    image_thumbnail.short_description = 'Miniatura'

    def get_tags(self, obj):
        """Display tags as comma-separated string"""
        if obj.tags:
            return format_html(
                '<span style="display: flex; flex-wrap: wrap; gap: 4px;">{}</span>',
                ''.join([
                    format_html(
                        '<span style="background: #4178be; color: white; padding: 2px 8px; '
                        'border-radius: 12px; font-size: 11px;">{}</span>',
                        tag
                    )
                    for tag in obj.tags
                ])
            )
        return "Brak tagów"
    get_tags.short_description = 'Tagi'

    def file_size_formatted(self, obj):
        """Format file size in human-readable format"""
        if obj.file_size:
            for unit in ['B', 'KB', 'MB', 'GB']:
                if obj.file_size < 1024.0:
                    return f"{obj.file_size:.1f} {unit}"
                obj.file_size /= 1024.0
            return f"{obj.file_size:.1f} TB"
        return "Brak"
    file_size_formatted.short_description = 'Rozmiar'

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        """
        Add custom widget for tags field with autocomplete
        """
        if db_field.name == 'tags':
            from django import forms
            from django.contrib.admin.widgets import AutocompleteSelectMultiple

            # Get all existing tags
            all_tags = set()
            for image in Image.objects.all():
                if image.tags:
                    all_tags.update(image.tags)

            # Create custom form field with tag suggestions
            class TagField(forms.JSONField):
                widget = forms.Textarea(attrs={
                    'rows': 2,
                    'placeholder': 'Wprowadź tagi oddzielone przecinkami, np: landscape, nature, mountains',
                    'class': 'vLargeTextField'
                })

                def prepare_value(self, value):
                    """Convert list to comma-separated string for display"""
                    if isinstance(value, list):
                        return ', '.join(value)
                    return value

                def to_python(self, value):
                    """Convert comma-separated string to list"""
                    if isinstance(value, str):
                        # Split by comma, strip whitespace, filter empty
                        tags = [tag.strip() for tag in value.split(',')]
                        return [tag for tag in tags if tag]
                    return value

            kwargs['form_field'] = TagField

        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        """
        Process tags before saving
        - Convert comma-separated string to list
        - Remove duplicates
        - Sort alphabetically
        """
        # Get tags from form
        tags = form.cleaned_data.get('tags', [])

        # Convert to list if it's a string
        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(',') if tag.strip()]

        # Remove duplicates and sort
        if tags:
            tags = sorted(list(set(tags)))

        obj.tags = tags
        super().save_model(request, obj, form, change)

    class Media:
        """Add custom CSS for tag styling"""
        css = {
            'all': ('admin/css/gallery.css',)
        }


# Customize admin site header
admin.site.site_header = "Bieszczady.plus Admin"
admin.site.site_title = "Bieszczady.plus"
admin.site.index_title = "Panel administracyjny"
