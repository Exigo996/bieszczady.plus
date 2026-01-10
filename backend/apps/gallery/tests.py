from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Image


class ImageModelTest(TestCase):
    """Test Image model functionality"""

    def test_image_creation(self):
        """Test creating an image with tags"""
        image = Image.objects.create(
            title='Test Image',
            description='Test description',
            tags=['landscape', 'nature'],
            # Note: image file would be needed in real test
        )
        self.assertEqual(image.title, 'Test Image')
        self.assertEqual(image.tags, ['landscape', 'nature'])

    def test_tags_storage(self):
        """Test that tags are stored correctly as JSON"""
        image = Image.objects.create(
            title='Test Image',
            tags=['mountains', 'sunset', 'bieszczady']
        )
        self.assertIsInstance(image.tags, list)
        self.assertEqual(len(image.tags), 3)


class ImageAPITest(APITestCase):
    """Test Image API endpoints"""

    def test_list_images(self):
        """Test GET /api/gallery/images/"""
        response = self.client.get('/api/gallery/images/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_by_tag(self):
        """Test GET /api/gallery/images/?tag=landscape"""
        # Create test images with different tags
        Image.objects.create(
            title='Mountain Landscape',
            tags=['landscape', 'mountains']
        )
        Image.objects.create(
            title='Portrait',
            tags=['portrait', 'people']
        )

        # Filter by landscape tag
        response = self.client.get('/api/gallery/images/?tag=landscape')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return only the landscape image

    def test_get_tags_endpoint(self):
        """Test GET /api/gallery/images/tags/"""
        Image.objects.create(
            title='Image 1',
            tags=['nature', 'landscape']
        )
        Image.objects.create(
            title='Image 2',
            tags=['nature', 'mountains']
        )

        response = self.client.get('/api/gallery/images/tags/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tags', response.data)
        self.assertIn('nature', response.data['tags'])
