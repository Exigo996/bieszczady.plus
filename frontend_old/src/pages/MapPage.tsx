import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { FeatureCollection } from 'geojson';

// More detailed Poland boundary
const polandGeoJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Poland' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // Western border (Germany)
            [14.12, 53.90],
            [14.35, 53.55],
            [14.55, 53.20],
            [14.70, 52.85],
            [14.75, 52.50],
            [14.65, 52.15],
            [14.70, 51.80],
            [14.95, 51.45],
            [15.05, 51.10],
            [14.95, 50.75],
            [14.85, 50.40],
            [15.05, 50.05],
            [15.25, 49.70],
            [15.55, 49.40],
            [15.85, 49.20],
            // Southern border (Czech Republic & Slovakia)
            [16.20, 49.00],
            [16.55, 48.90],
            [16.90, 48.85],
            [17.25, 48.85],
            [17.60, 48.90],
            [17.95, 49.00],
            [18.30, 49.15],
            [18.65, 49.25],
            [18.95, 49.35],
            [19.25, 49.35],
            [19.55, 49.30],
            [19.85, 49.25],
            [20.15, 49.30],
            [20.45, 49.40],
            [20.75, 49.45],
            [21.05, 49.45],
            [21.35, 49.40],
            [21.65, 49.35],
            [21.95, 49.30],
            [22.25, 49.20],
            [22.40, 49.10],
            [22.50, 49.05],
            [22.65, 49.00],
            [22.80, 48.95],
            [22.95, 48.93],
            [23.10, 48.95],
            // Eastern border (Ukraine & Belarus)
            [23.25, 49.00],
            [23.40, 49.10],
            [23.55, 49.25],
            [23.75, 49.35],
            [23.95, 49.55],
            [24.10, 49.80],
            [24.15, 50.10],
            [24.10, 50.40],
            [23.95, 50.70],
            [23.90, 51.00],
            [23.95, 51.30],
            [23.90, 51.60],
            [23.85, 51.90],
            [23.90, 52.20],
            [23.95, 52.50],
            [23.85, 52.80],
            [23.75, 53.10],
            [23.65, 53.40],
            [23.55, 53.70],
            [23.45, 54.00],
            [23.25, 54.30],
            // Northern border (Lithuania & Russia)
            [23.00, 54.40],
            [22.75, 54.45],
            [22.50, 54.45],
            [22.25, 54.42],
            [22.00, 54.40],
            [21.75, 54.42],
            [21.50, 54.45],
            [21.25, 54.47],
            [21.00, 54.48],
            [20.75, 54.49],
            [20.50, 54.50],
            [20.25, 54.50],
            [20.00, 54.50],
            [19.75, 54.50],
            [19.50, 54.52],
            [19.25, 54.55],
            [19.00, 54.60],
            [18.75, 54.65],
            [18.50, 54.72],
            [18.25, 54.78],
            [18.00, 54.82],
            [17.75, 54.85],
            [17.50, 54.86],
            [17.25, 54.85],
            [17.00, 54.82],
            [16.75, 54.78],
            [16.50, 54.72],
            [16.25, 54.65],
            [16.00, 54.57],
            [15.75, 54.48],
            [15.50, 54.38],
            [15.25, 54.27],
            [15.00, 54.15],
            [14.75, 54.02],
            [14.50, 53.95],
            [14.30, 53.92],
            [14.12, 53.90], // Close polygon
          ],
        ],
      },
    },
  ],
};

// Category colors matching EventCard component
const categoryColors: Record<string, string> = {
  CONCERT: '#9333ea', // purple
  FESTIVAL: '#ec4899', // pink
  THEATRE: '#ef4444', // red
  CINEMA: '#6366f1', // indigo
  WORKSHOP: '#22c55e', // green
  FOOD: '#f97316', // orange
  CULTURAL: '#3b82f6', // blue
  OTHER: '#6b7280', // gray
};

// Create custom marker icon with category color
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="${color}"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

// Mock event locations - will be replaced with API data
const eventLocations = [
  {
    id: 1,
    name: 'Ustrzycki Dom Kultury',
    coordinates: [49.4302, 22.5965] as [number, number],
    category: 'CONCERT' as const,
    events: [
      { title: '„André Rieu. Wesołych Świąt!"', date: '21 grudnia 2025', category: 'CONCERT' },
      { title: 'KOCHLIWY AMBASADOR', date: '19 grudnia 2025', category: 'THEATRE' },
      { title: 'WIELKIE OSTRZEŻENIE - MEKSYK', date: '20 grudnia 2025', category: 'CINEMA' },
    ],
  },
  {
    id: 2,
    name: 'Cisna',
    coordinates: [49.3500, 22.4833] as [number, number],
    category: 'FESTIVAL' as const,
    events: [{ title: 'XII Zimowy Maraton Bieszczadzki', date: '24 stycznia 2026', category: 'FESTIVAL' }],
  },
  {
    id: 3,
    name: 'Moczary 39',
    coordinates: [49.3500, 22.5000] as [number, number],
    category: 'WORKSHOP' as const,
    events: [{ title: 'Warsztaty z ogrodnictwa i zielarstwa', date: '15 marca 2026', category: 'WORKSHOP' }],
  },
  {
    id: 5,
    name: 'Wetlina',
    coordinates: [49.1500, 22.4833] as [number, number],
    category: 'FOOD' as const,
    events: [{ title: 'Degustacja Lokalnych Serów i Miodów', date: '25 czerwca 2025', category: 'FOOD' }],
  },
];

// Category labels in Polish
const categoryLabels: Record<string, string> = {
  CONCERT: 'Koncerty',
  FESTIVAL: 'Festiwale',
  THEATRE: 'Teatr',
  CINEMA: 'Kino',
  WORKSHOP: 'Warsztaty',
  FOOD: 'Gastronomia',
  CULTURAL: 'Kultura',
  OTHER: 'Inne',
};

// Component to handle map updates
interface MapUpdaterProps {
  center: [number, number] | null;
  zoom: number | null;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ center, zoom }) => {
  const map = useMap();

  React.useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, {
        duration: 1.5,
      });
    }
  }, [center, zoom, map]);

  return null;
};

const MapPage: React.FC = () => {
  const [activeLocation, setActiveLocation] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number | null>(null);

  // Center on Bieszczady region
  const center: [number, number] = [49.3500, 22.5000];

  const handleLocationClick = (locationId: number) => {
    setActiveLocation(locationId);
    const location = eventLocations.find((loc) => loc.id === locationId);
    if (location) {
      setMapCenter(location.coordinates);
      setMapZoom(13);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Description */}
        <p className="text-lg text-gray-600 mb-6">
          Zobacz wszystkie wydarzenia w Bieszczadach na mapie
        </p>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Kategorie wydarzeń:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {Object.entries(categoryColors).map(([category, color]) => (
              <div key={category} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700">{categoryLabels[category]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-[600px] w-full">
            <MapContainer
              center={center}
              zoom={10}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <MapUpdater center={mapCenter} zoom={mapZoom} />
              {/* Base map with terrain */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Poland border */}
              <GeoJSON
                data={polandGeoJSON}
                style={{
                  fillColor: 'transparent',
                  fillOpacity: 0,
                  color: '#16a34a',
                  weight: 3,
                  dashArray: '10, 5',
                }}
              />

              {eventLocations.map((location) => {
                const markerColor = categoryColors[location.category] || categoryColors.OTHER;
                return (
                  <Marker
                    key={location.id}
                    position={location.coordinates}
                    icon={createColoredIcon(markerColor)}
                    eventHandlers={{
                      click: () => setActiveLocation(location.id),
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                        <div className="space-y-2">
                          {location.events.map((event, idx) => (
                            <div key={idx} className="text-sm">
                              <p className="font-semibold text-blue-600">{event.title}</p>
                              <p className="text-gray-600">{event.date}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Location List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {eventLocations.map((location) => (
            <div
              key={location.id}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-300 ${
                activeLocation === location.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'hover:shadow-lg hover:-translate-y-1'
              }`}
              onClick={() => handleLocationClick(location.id)}
            >
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0 mt-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
                  <p className="text-sm text-gray-600">
                    {location.events.length}{' '}
                    {location.events.length === 1 ? 'wydarzenie' : 'wydarzenia'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
