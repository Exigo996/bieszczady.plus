from django.contrib import admin
from django.utils.html import format_html
from django import forms

from .models import Image


class ImageAdminForm(forms.ModelForm):
    """
    Custom form for Image model with comma-separated tag input
    """
    tags = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'rows': 2,
            'placeholder': 'Wprowadź tagi oddzielone przecinkami, np: landscape, nature, mountains',
            'class': 'vLargeTextField'
        }),
        help_text='Wprowadź tagi oddzielone przecinkami. Mogą to być istniejące tagi lub nowe.'
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Convert existing tags list to comma-separated string
        if self.instance and self.instance.tags:
            self.fields['tags'].initial = ', '.join(self.instance.tags)

    def clean_tags(self):
        """
        Convert comma-separated string to list
        Remove duplicates and sort
        """
        tags_str = self.cleaned_data.get('tags', '')

        if not tags_str:
            return []

        # Split by comma, strip whitespace, filter empty
        tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]

        # Remove duplicates and sort
        tags = sorted(list(set(tags)))

        return tags


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    """
    Admin interface for Image model with tag autocomplete widget
    """
    form = ImageAdminForm

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

    # Organize fieldsets for better UX
    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('title', 'description')
        }),
        ('Obraz', {
            'fields': ('image', 'image_preview')
        }),
        ('Tagi', {
            'fields': ('tags',),
            'description': 'Wprowadź tagi oddzielone przecinkami. Przykład: landscape, nature, mountains'
        }),
        ('Metadane', {
            'fields': ('file_size', 'width', 'height', 'uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        """Show image preview in detail view"""
        if obj.image and hasattr(obj.image, 'url'):
            try:
                return format_html(
                    '<img src="{}" style="max-width: 600px; max-height: 400px; object-fit: contain;" />',
                    obj.image.url
                )
            except Exception:
                return "Nie można wyświetlić podglądu"
        return "Brak obrazu"
    image_preview.short_description = 'Podgląd'

    def image_thumbnail(self, obj):
        """Show small thumbnail in list view"""
        if obj.image and hasattr(obj.image, 'url'):
            try:
                return format_html(
                    '<img src="{}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />',
                    obj.image.url
                )
            except Exception:
                return "Brak"
        return "Brak"
    image_thumbnail.short_description = 'Miniatura'

    def get_tags(self, obj):
        """Display tags as comma-separated string"""
        if obj.tags:
            return format_html(
                '<div style="display: flex; flex-wrap: wrap; gap: 4px;">{}</div>',
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
            size = obj.file_size
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024.0:
                    return f"{size:.1f} {unit}"
                size /= 1024.0
            return f"{size:.1f} TB"
        return "Brak"
    file_size_formatted.short_description = 'Rozmiar'

    def save_model(self, request, obj, form, change):
        """
        Save model - tags are already processed by the form
        """
        obj.tags = form.cleaned_data.get('tags', [])
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
