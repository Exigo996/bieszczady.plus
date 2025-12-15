import React from 'react';
import type { Event } from '../../types/event';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale/pl';

interface EventCardProps {
  event: Event;
  language?: 'pl' | 'en' | 'uk';
}

const EventCard: React.FC<EventCardProps> = ({ event, language = 'pl' }) => {
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
    <article
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group flex flex-col h-full"
      role="article"
      aria-label={`Wydarzenie: ${title}`}
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
        {event.ticket_url ? (
          <a
            href={event.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
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
        ) : (
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Zobacz szczegóły wydarzenia: ${title}`}
          >
            Zobacz szczegóły
          </button>
        )}
      </div>
    </article>
  );
};

export default EventCard;
