from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Image
from .serializers import ImageSerializer, ImageListSerializer


class ImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Image model with tag filtering

    Endpoints:
    - GET /api/gallery/images/ - List all images (paginated)
    - POST /api/gallery/images/ - Upload new image
    - GET /api/gallery/images/?tag=mountains - Filter by tag
    - GET /api/gallery/images/:id/ - Get single image
    - PUT/PATCH /api/gallery/images/:id/ - Update image
    - DELETE /api/gallery/images/:id/ - Delete image
    - GET /api/gallery/images/tags/ - Get all unique tags
    """
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return ImageListSerializer
        return ImageSerializer

    def get_queryset(self):
        """
        Filter images by tag if provided in query params

        Examples:
        - /api/gallery/images/?tag=mountains
        - /api/gallery/images/?tag=mountains&tag=sunset
        """
        queryset = Image.objects.all()

        # Get tags from query params
        # Multiple tags can be provided: ?tag=mountains&tag=sunset
        tags = self.request.query_params.getlist('tag')

        if tags:
            # Filter images that contain ALL specified tags
            for tag in tags:
                queryset = queryset.filter(tags__contains=tag)

        return queryset.order_by('-uploaded_at')

    @action(detail=False, methods=['get'])
    def tags(self, request):
        """
        Get all unique tags from all images
        Returns sorted list of unique tags

        URL: /api/gallery/images/tags/
        """
        # Get all images and extract tags
        images = Image.objects.all()
        all_tags = set()

        for image in images:
            if image.tags:
                all_tags.update(image.tags)

        # Return sorted list
        sorted_tags = sorted(list(all_tags))
        return Response({
            'count': len(sorted_tags),
            'tags': sorted_tags
        })
