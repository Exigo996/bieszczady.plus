import React, { useMemo, useState } from 'react';
import type { ZrobieEvent } from '../../types/zrobie-event';
import type { Organizer } from '../../types/organizer';
import { getEventDateTime } from '../../types/zrobie-event';

interface OrganizerHeroSplitScreenProps {
  organizer: Organizer;
  events: ZrobieEvent[];
}

const OrganizerHeroSplitScreen: React.FC<OrganizerHeroSplitScreenProps> = ({ organizer, events }) => {
  const [selectedEvent, setSelectedEvent] = useState<ZrobieEvent | null>(null);

  // Get upcoming events (next 2)
  const upcomingEvents = useMemo(() => {
    const now = new Date();

    // Filter out past events
    const futureEvents = events.filter((event) => {
      const eventDate = getEventDateTime(event);
      return eventDate && eventDate >= now;
    });

    // Sort by date and take first 2
    return futureEvents
      .sort((a, b) => {
        const dateA = getEventDateTime(a);
        const dateB = getEventDateTime(b);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 2);
  }, [events]);

  // Scroll to events section
  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[200px]">
        {/* Left Side - Organizer Image */}
        <div className="relative h-[150px] lg:h-auto">
          <img
            src={organizer.image || '/herob.jpg'}
            alt={organizer.name}
            className="absolute inset-0 w-full h-full object-cover object-[center_15%]"
          />

          {/* Gradient Overlay - creates soft blur effect on right edge (hidden on mobile) */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent from-70% to-gray-50" />

          {/* Organizer Name Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
            <div className="p-4 lg:p-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {organizer.name}
              </h1>
              {organizer.location && (
                <p className="text-white/90 text-sm mt-1">
                  {'name' in organizer.location ? organizer.location.name : organizer.location.city}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Upcoming Events Widget (hidden on mobile) */}
        <div className="hidden lg:flex bg-gray-50 p-4 lg:p-6 flex-col justify-center items-center">
          <div className="max-w-md w-full">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 text-center">
              Nadchodzące wydarzenia
            </h2>
            <p className="text-gray-600 mb-4 text-sm text-center">
              {organizer.description || 'Odkryj wydarzenia organizowane przez tego organizatora'}
            </p>

            {/* Upcoming Events List */}
            {upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.map((event) => {
                  const eventDate = getEventDateTime(event);
                  return (
                    <div
                      key={event.ID}
                      onClick={() => setSelectedEvent(event)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                    >
                      <div className="flex items-center gap-3">
                        {/* Event Image */}
                        <div className="flex-shrink-0 w-24 h-20">
                          {event.ImageURL ? (
                            <img
                              src={event.ImageURL}
                              alt={event.Title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500" />
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0 py-2 pr-3">
                          <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1">
                            {event.Title}
                          </h3>
                          {eventDate && (
                            <p className="text-xs text-gray-600">
                              {eventDate.toLocaleDateString('pl-PL', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-0.5">
                            {event.Venue || 'Brak lokalizacji'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* View All Button */}
                <button
                  onClick={scrollToEvents}
                  className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Zobacz wszystkie wydarzenia →
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-600 mb-4">
                  Brak nadchodzących wydarzeń
                </p>
                <button
                  onClick={scrollToEvents}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Przeglądaj wszystkie wydarzenia
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Image */}
            <div className="relative h-64">
              {selectedEvent.ImageURL ? (
                <img
                  src={selectedEvent.ImageURL}
                  alt={selectedEvent.Title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500" />
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-lg"
                aria-label="Zamknij"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedEvent.Title}
              </h2>

              {/* Event Meta */}
              <div className="space-y-2 mb-6">
                {(() => {
                  const eventDate = getEventDateTime(selectedEvent);
                  if (!eventDate) return null;
                  return (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {eventDate.toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {' '}
                      {eventDate.toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  );
                })()}

                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {selectedEvent.Venue || 'Brak lokalizacji'}
                </div>

                {selectedEvent.Price && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    {selectedEvent.Price || 'Bezpłatne'}
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedEvent.Description && (
                <div className="prose max-w-none mb-6">
                  <p
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: selectedEvent.Description }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedEvent.SourceURL && (
                  <a
                    href={selectedEvent.SourceURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                  >
                    Kup bilet
                  </a>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OrganizerHeroSplitScreen;
