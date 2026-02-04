import React, { useState } from "react";
import type { ZrobieEvent } from "../../types/zrobie-event";
import { format } from "date-fns";
import { pl } from "date-fns/locale/pl";
import { getEventDateTime, parsePrice, getCurrency, isEventFree } from "../../types/zrobie-event";
import { API_BASE_URL } from "../../api/client";

interface EventCardProps {
  event: ZrobieEvent;
  language?: "pl" | "en" | "uk";
  viewMode?: "grid" | "list";
}

// Extract origin from API_BASE_URL (e.g., "https://content.zrobie.jutro.net")
const API_ORIGIN = new URL(API_BASE_URL).origin;

// Helper to convert relative API URLs to absolute URLs
const getAbsoluteImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  // If URL is already absolute (starts with http), return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Relative URL - prepend origin only (API already returns /api/v1/... paths)
  return `${API_ORIGIN}${url}`;
};

const EventCard: React.FC<EventCardProps> = ({
  event,
  language = "pl",
  viewMode = "grid",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Title is now a simple string (no multi-language support in new API)
  const title = event.Title;

  // ImageURL - convert relative URLs to absolute
  const imageUrl = getAbsoluteImageUrl(event.ImageURL);

  // Get combined datetime
  const eventDateTime = getEventDateTime(event);

  const formatEventDate = (date: Date | null) => {
    if (!date) return "Data do ustalenia";
    try {
      return format(date, "d MMMM yyyy, HH:mm", { locale: pl });
    } catch {
      return "Data nieprawidłowa";
    }
  };

  const formatEventTime = (date: Date | null) => {
    if (!date) return "";
    try {
      return format(date, "HH:mm");
    } catch {
      return "";
    }
  };

  const formatEventDay = (date: Date | null) => {
    if (!date) return "";
    try {
      return format(date, "d MMM", { locale: pl });
    } catch {
      return "";
    }
  };

  // Price display
  const displayPrice = event.Price || "Bezpłatne";
  const isFree = isEventFree(event);
  const currency = getCurrency(event.Price);

  // List view layout
  if (viewMode === "list") {
    return (
      <>
        {/* Horizontal Event Card for List View */}
        <article
          className="flex flex-row gap-4 overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md group"
          role="article"
          aria-label={`Wydarzenie: ${title}`}
          onClick={() => setIsExpanded(true)}
        >
          {/* Square Image Container */}
          <div className="relative flex-shrink-0 w-32 h-32 overflow-hidden rounded-lg md:w-40 md:h-40">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 py-3 pr-4">
            <h3 className="mb-2 text-lg font-bold text-gray-900 md:text-xl line-clamp-2">
              {title}
            </h3>

            <div className="space-y-1.5 mb-3">
              {/* Date */}
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="flex-shrink-0 w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{formatEventDate(eventDateTime)}</span>
              </div>

              {/* Location */}
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="flex-shrink-0 w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{event.Venue || "Brak lokalizacji"}</span>
              </div>

              {/* Price */}
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="flex-shrink-0 w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
                {isFree ? "Bezpłatne" : displayPrice}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white text-xs md:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Zobacz szczegóły
            </button>
          </div>
        </article>

        {/* Modal */}
        {isExpanded && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsExpanded(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero Image with Close Button */}
              <div className="relative overflow-hidden h-72">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500"></div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                {/* Close Button */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute p-2 text-white transition-all rounded-full top-4 right-4 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-110"
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

                {/* Title and Date at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="flex-1 text-3xl font-bold text-white drop-shadow-lg">
                      {title}
                    </h2>
                    {eventDateTime && (
                      <div className="bg-white rounded-xl shadow-lg px-4 py-3 text-center min-w-[80px] flex-shrink-0">
                        <div className="text-xs font-semibold text-gray-600 uppercase">
                          {format(eventDateTime, "MMM", { locale: pl })}
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          {format(eventDateTime, "d")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(eventDateTime, "EEE", { locale: pl })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-18rem)] p-8">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2">
                  {/* Date & Time */}
                  <div className="p-4 border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-5 h-5 mr-2 text-blue-600"
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
                      <span className="text-xs font-semibold text-blue-900 uppercase">
                        Data i godzina
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">
                      {formatEventDate(eventDateTime)}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="p-4 border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-5 h-5 mr-2 text-purple-600"
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
                      <span className="text-xs font-semibold text-purple-900 uppercase">
                        Miejsce
                      </span>
                    </div>
                    <p className="text-lg font-bold text-purple-900">
                      {event.Venue || "Brak lokalizacji"}
                    </p>
                    {event.Site?.Name && (
                      <p className="mt-1 text-sm text-purple-700">
                        📍 {event.Site.Name}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="p-4 border border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-5 h-5 mr-2 text-green-600"
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
                      <span className="text-xs font-semibold text-green-900 uppercase">
                        Cena
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-900">
                      {isFree ? "Wstęp wolny 🎉" : displayPrice}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="p-4 border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-5 h-5 mr-2 text-orange-600"
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
                      <span className="text-xs font-semibold text-orange-900 uppercase">
                        Informacje dodatkowe
                      </span>
                    </div>
                    {event.Duration > 0 ? (
                      <p className="text-lg font-bold text-orange-900">
                        {event.Duration} min
                      </p>
                    ) : (
                      <p className="text-lg font-bold text-orange-900">—</p>
                    )}
                  </div>
                </div>

                {/* Description Section */}
                {event.Description && (
                  <div className="mb-8">
                    <h3 className="flex items-center mb-4 text-xl font-bold text-gray-900">
                      <div className="w-1 h-6 mr-3 bg-blue-600 rounded-full"></div>
                      Opis wydarzenia
                    </h3>
                    <div className="p-6 border border-gray-200 bg-gray-50 rounded-xl">
                      <p
                        className="text-base leading-relaxed text-gray-700"
                        dangerouslySetInnerHTML={{ __html: event.Description }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {event.SourceURL && (
                    <a
                      href={event.SourceURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center flex-1 px-6 py-4 font-bold text-white transition-all transform shadow-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl hover:scale-105 hover:shadow-xl"
                    >
                      <svg
                        className="w-6 h-6 mr-2"
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
                  )}
                  {event.Site?.BaseURL && (
                    <a
                      href={event.Site.BaseURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-4 font-medium text-gray-900 transition-all bg-gray-100 hover:bg-gray-200 rounded-xl"
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Więcej informacji
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Grid view layout (default)
  return (
    <>
      {/* Minimal Event Card */}
      <article
        className="relative overflow-hidden transition-all duration-300 bg-white shadow-sm cursor-pointer rounded-2xl hover:shadow-2xl group"
        role="article"
        aria-label={`Wydarzenie: ${title}`}
        onClick={() => setIsExpanded(true)}
      >
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500"></div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* Date Badge - Top Right */}
          <div className="absolute top-3 right-3 z-10">
            {eventDateTime && (
              <div className="px-3 py-2 text-xs font-bold text-gray-700 rounded-lg bg-white/90 backdrop-blur-sm">
                {formatEventDay(eventDateTime)} • {formatEventTime(eventDateTime)}
              </div>
            )}
          </div>

          {/* Title and Location - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="mb-2 text-lg font-bold text-white line-clamp-2 drop-shadow-lg">
              {title}
            </h3>

            {/* Location */}
            <div className="flex items-center text-sm text-white/90">
              <svg
                className="w-4 h-4 mr-1.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="truncate drop-shadow-lg">
                {event.Venue || "Brak lokalizacji"}
              </span>
            </div>
          </div>

          {/* Hover Indicator */}
          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-black/40">
            <div className="p-3 transition-transform transform bg-white rounded-full group-hover:scale-110">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </article>

      {/* Professional Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero Image with Close Button */}
            <div className="relative overflow-hidden h-72">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500"></div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute p-2 text-white transition-all rounded-full top-4 right-4 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:scale-110"
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

              {/* Title and Date at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="flex-1 text-3xl font-bold text-white drop-shadow-lg">
                    {title}
                  </h2>
                  {eventDateTime && (
                    <div className="bg-white rounded-xl shadow-lg px-4 py-3 text-center min-w-[80px] flex-shrink-0">
                      <div className="text-xs font-semibold text-gray-600 uppercase">
                        {format(eventDateTime, "MMM", { locale: pl })}
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {format(eventDateTime, "d")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(eventDateTime, "EEE", { locale: pl })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-18rem)] p-8">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2">
                {/* Date & Time */}
                <div className="p-4 border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
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
                    <span className="text-xs font-semibold text-blue-900 uppercase">
                      Data i godzina
                    </span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {formatEventDate(eventDateTime)}
                  </p>
                </div>

                {/* Location */}
                <div className="p-4 border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-600"
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
                    <span className="text-xs font-semibold text-purple-900 uppercase">
                      Miejsce
                    </span>
                  </div>
                  <p className="text-lg font-bold text-purple-900">
                    {event.Venue || "Brak lokalizacji"}
                  </p>
                  {event.Site?.Name && (
                    <p className="mt-1 text-sm text-purple-700">
                      📍 {event.Site.Name}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="p-4 border border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 mr-2 text-green-600"
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
                    <span className="text-xs font-semibold text-green-900 uppercase">
                      Cena
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {isFree ? "Wstęp wolny 🎉" : displayPrice}
                  </p>
                </div>

                {/* Duration */}
                <div className="p-4 border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-5 h-5 mr-2 text-orange-600"
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
                    <span className="text-xs font-semibold text-orange-900 uppercase">
                      Informacje dodatkowe
                    </span>
                  </div>
                  {event.Duration > 0 ? (
                    <p className="text-lg font-bold text-orange-900">
                      {event.Duration} min
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-orange-900">—</p>
                  )}
                </div>
              </div>

              {/* Description Section */}
              {event.Description && (
                <div className="mb-8">
                  <h3 className="flex items-center mb-4 text-xl font-bold text-gray-900">
                    <div className="w-1 h-6 mr-3 bg-blue-600 rounded-full"></div>
                    Opis wydarzenia
                  </h3>
                  <div className="p-6 border border-gray-200 bg-gray-50 rounded-xl">
                    <p
                      className="text-base leading-relaxed text-gray-700"
                      dangerouslySetInnerHTML={{ __html: event.Description }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {event.SourceURL && (
                  <a
                    href={event.SourceURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center flex-1 px-6 py-4 font-bold text-white transition-all transform shadow-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl hover:scale-105 hover:shadow-xl"
                  >
                    <svg
                      className="w-6 h-6 mr-2"
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
                )}
                {event.Site?.BaseURL && (
                  <a
                    href={event.Site.BaseURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-4 font-medium text-gray-900 transition-all bg-gray-100 hover:bg-gray-200 rounded-xl"
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Więcej informacji
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;
