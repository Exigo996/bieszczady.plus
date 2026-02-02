import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { POI } from "../../types/poi";

interface POICardProps {
  poi: POI;
}

const POICard: React.FC<POICardProps> = ({ poi }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/lokalni-producenci/${poi.ID}`);
  };

  // Generate a color based on POIType
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      "producent": "#22c55e", // green
      "punkt": "#3b82f6", // blue
      "atrakcja": "#f97316", // orange
      "nocleg": "#9333ea", // purple
      "jedzenie": "#ef4444", // red
      "default": "#6b7280", // gray
    };
    return colors[type.toLowerCase()] || colors.default;
  };

  const color = getTypeColor(poi.POIType);

  return (
    <article
      className="relative overflow-hidden transition-all duration-300 bg-white shadow-sm cursor-pointer rounded-2xl hover:shadow-xl group"
      role="article"
      aria-label={`POI: ${poi.Name}`}
      onClick={handleClick}
    >
      {/* Header with type badge */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
        {/* Default gradient background since POIs don't have images */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900"></div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className="px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-lg"
            style={{ backgroundColor: color }}
          >
            {poi.POIType}
          </div>
        </div>

        {/* Geometry Type Badge */}
        <div className="absolute top-3 right-3 z-10">
          <div className="px-3 py-1.5 text-xs font-bold text-white bg-black/50 rounded-lg backdrop-blur-sm">
            {poi.GeometryType === "point" ? "📍 Punkt" : "🗺️ Obszar"}
          </div>
        </div>

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-lg">
            {poi.Name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        {poi.Description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {poi.Description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            {poi.IsVerified && (
              <span className="flex items-center text-green-600">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Zweryfikowany
              </span>
            )}
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {poi.Point.lat.toFixed(4)}, {poi.Point.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default POICard;
