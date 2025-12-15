from django.shortcuts import render
from rest_framework import viewsets
from .models import Event
from .serializers import EventSerializer

# Create your views here.

class EventViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Event instances.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
