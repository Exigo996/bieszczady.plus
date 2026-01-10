from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import ImageViewSet


# Create router and register viewset
router = DefaultRouter()
router.register(r'images', ImageViewSet, basename='gallery-image')

urlpatterns = [
    path('', include(router.urls)),
]
