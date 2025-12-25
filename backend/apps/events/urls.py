from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, OrganizerViewSet

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'organizers', OrganizerViewSet, basename='organizer')

urlpatterns = [
    path('', include(router.urls)),
]