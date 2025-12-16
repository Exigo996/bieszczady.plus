import React, { useState } from 'react';
import type { Event } from '../../types/event';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale/pl';

interface EventCardProps {
  event: Event;
  language?: 'pl' | 'en' | 'uk';
}

const EventCard: React.FC<EventCardProps> = ({ event, language = 'pl' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const title = event.title[language] || event.title.pl;
  const description = event.description[language] || event.description.pl;

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy, HH:mm', { locale: pl });
    } catch {
      return dateString;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      CONCERT: 'Koncert',
      FESTIVAL: 'Festiwal',
      THEATRE: 'Teatr',
      CINEMA: 'Kino',
      WORKSHOP: 'Warsztat',
      FOOD: 'Gastronomia',
      CULTURAL: 'Kultura',
      OTHER: 'Inne',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      CONCERT: 'bg-purple-100 text-purple-800',
      FESTIVAL: 'bg-pink-100 text-pink-800',
      THEATRE: 'bg-red-100 text-red-800',
      CINEMA: 'bg-indigo-100 text-indigo-800',
      WORKSHOP: 'bg-green-100 text-green-800',
      FOOD: 'bg-orange-100 text-orange-800',
      CULTURAL: 'bg-blue-100 text-blue-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <article
        className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer"
        role="article"
        aria-label={`Wydarzenie: ${title}`}
        onClick={() => setIsExpanded(true)}
      >
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-lg font-medium opacity-50">zdjęcie</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
              event.category
            )}`}
          >
            {getCategoryLabel(event.category)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">{description}</p>

        {/* Date */}
        <div className="flex items-center text-sm text-gray-700 mb-2">
          <svg
            className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <time dateTime={event.start_date}>{formatEventDate(event.start_date)}</time>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between text-sm text-gray-700 mb-4">
          <div className="flex items-center flex-1 min-w-0">
            <svg
              className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{event.location.name}</span>
          </div>
          {event.location.distance !== undefined && (
            <span className="ml-2 font-semibold text-blue-600 flex-shrink-0">
              {event.location.distance.toFixed(1)} km
            </span>
          )}
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* Action Button */}
        {event.ticket_url && (
          <a
            href={event.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-center inline-flex items-center justify-center"
            aria-label={`Kup bilet na wydarzenie: ${title}`}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            Kup bilet
          </a>
        )}
      </div>
    </article>

      {/* Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Zamknij"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Image */}
              <div className="mb-6 relative">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-medium opacity-50">zdjęcie</span>
                  </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                      event.category
                    )}`}
                  >
                    {getCategoryLabel(event.category)}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-4 mb-6">
                {/* Date */}
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">{formatEventDate(event.start_date)}</span>
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="font-medium">{event.location.name}</span>
                  {event.location.distance !== undefined && (
                    <span className="ml-2 text-blue-600 font-semibold">
                      ({event.location.distance.toFixed(1)} km)
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">
                    {event.price_type === 'FREE'
                      ? 'Wstęp wolny'
                      : `${event.price_amount} ${event.price_currency}`}
                  </span>
                </div>

                {/* Duration */}
                {event.duration_minutes && (
                  <div className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      Czas trwania: {event.duration_minutes} minut
                    </span>
                  </div>
                )}

                {/* Age Restriction */}
                {event.age_restriction && (
                  <div className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">Wiek: {event.age_restriction}+</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Opis</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* Ticket Button */}
              {event.ticket_url && (
                <div className="pt-6 border-t border-gray-200">
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                    Kup bilet
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;
