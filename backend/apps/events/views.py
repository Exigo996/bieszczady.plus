from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Event, Organizer, EventDate
from .serializers import (
    EventSerializer,
    EventListSerializer,
    OrganizerSerializer,
    OrganizerListSerializer,
    EventDateSerializer,
)


class EventViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing Event instances.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_serializer_class(self):
        """Use lighter serializer for list view"""
        if self.action == 'list':
            return EventListSerializer
        return EventSerializer

    def get_queryset(self):
        """Optimize queryset with prefetch_related"""
        queryset = Event.objects.all()
        if self.action == 'list':
            queryset = queryset.select_related('organizer').prefetch_related('event_dates')
        return queryset


class OrganizerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing Organizer instances.
    Read-only API for frontend to list and retrieve organizers.
    """
    queryset = Organizer.objects.filter(is_active=True)
    serializer_class = OrganizerSerializer

    def get_serializer_class(self):
        """Use lighter serializer for list view"""
        if self.action == 'list':
            return OrganizerListSerializer
        return OrganizerSerializer

    def get_queryset(self):
        """Optimize queryset and allow filtering"""
        queryset = Organizer.objects.filter(is_active=True)

        # Add prefetch for events count
        queryset = queryset.prefetch_related('events')

        # Optional: Filter by query parameter
        has_events = self.request.query_params.get('has_events', None)
        if has_events == 'true':
            queryset = queryset.filter(events__isnull=False).distinct()

        return queryset.order_by('name')

    @action(detail=True, methods=['get'])
    def events(self, request, pk=None):
        """
        Get all events for a specific organizer.
        URL: /api/organizers/{id}/events/
        """
        organizer = self.get_object()
        events = organizer.events.all().order_by('-start_date')
        serializer = EventListSerializer(events, many=True, context={'request': request})
        return Response(serializer.data)
