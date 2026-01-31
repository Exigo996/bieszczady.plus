import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import OrganizerHeroSplitScreen from "../components/organizers/OrganizerHeroSplitScreen";
import OrganizerEventsSection from "../components/organizers/OrganizerEventsSection";
import { fetchOrganizerBySlug, fetchOrganizerEvents } from "../api/organizers";
import type { ZrobieEvent } from "../types/zrobie-event";

const OrganizerPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  console.log(slug);
  const navigate = useNavigate();

  // Fetch organizer by slug
  const {
    data: organizer,
    isLoading: isLoadingOrganizer,
    isError: isOrganizerError,
  } = useQuery({
    queryKey: ["organizer", slug],
    queryFn: () => fetchOrganizerBySlug(slug!),
    enabled: !!slug,
    retry: false,
  });

  // Fetch organizer events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<ZrobieEvent[]>({
    queryKey: ["organizer-events", slug],
    queryFn: () => fetchOrganizerEvents(slug!),
    enabled: !!slug && !isOrganizerError,
    retry: 1,
  });

  // Loading state
  if (isLoadingOrganizer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Ładowanie organizatora...</p>
        </div>
      </div>
    );
  }

  // Error state - organizer not found
  if (isOrganizerError || !organizer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Organizator nie został znaleziony
          </h1>
          <p className="text-gray-600 mb-6">
            Organizator o podanym identyfikatorze nie istnieje lub został
            usunięty.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Powrót do strony głównej
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <OrganizerHeroSplitScreen
        organizer={organizer}
        events={events}
      />
      {!isLoadingEvents && <OrganizerEventsSection organizer={organizer} />}
    </>
  );
};

export default OrganizerPage;
