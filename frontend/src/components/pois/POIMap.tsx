import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import type { POI } from "../../types/poi";
import { toLeafletCoords, getLeafletPosition } from "../../types/poi";
import "leaflet/dist/leaflet.css";

interface POIMapProps {
  pois: POI[];
  selectedPOI: POI | null;
  onPOISelect: (poi: POI) => void;
  center?: [number, number];
  zoom?: number;
}

// Custom marker icon
const createCustomIcon = (color: string = "#3b82f6") => {
  return L.divIcon({
    className: "custom-poi-marker",
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

// Get color for POI type
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    "producent": "#22c55e",
    "punkt": "#3b82f6",
    "atrakcja": "#f97316",
    "nocleg": "#9333ea",
    "jedzenie": "#ef4444",
  };
  return colors[type.toLowerCase()] || "#6b7280";
};

// Component to update map view
interface MapUpdaterProps {
  center: [number, number] | null;
  zoom: number | null;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ center, zoom }) => {
  const map = useMap();

  React.useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
};

const POIMap: React.FC<POIMapProps> = ({
  pois,
  selectedPOI,
  onPOISelect,
  center = [49.35, 22.5],
  zoom = 9,
}) => {
  const [mapCenter, setMapCenter] = React.useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = React.useState<number | null>(null);

  // Filter POIs with geometry data
  const poisWithPoints = pois.filter((poi) => (poi.Point || poi.Centroid));
  const poisWithPolygons = pois.filter(
    (poi) => poi.GeometryType === "polygon" && poi.polygon
  );

  // Handle marker click
  const handleMarkerClick = (poi: POI) => {
    onPOISelect(poi);
    if (poi.Point || poi.Centroid) {
      setMapCenter(getLeafletPosition(poi.Point, poi.Centroid));
      setMapZoom(13);
    }
  };

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Point markers */}
        {poisWithPoints.map((poi) => {
          const color = getTypeColor(poi.POIType);
          const position = getLeafletPosition(poi.Point, poi.Centroid);

          return (
            <Marker
              key={`point-${poi.ID}`}
              position={position}
              icon={createCustomIcon(color)}
              eventHandlers={{
                click: () => handleMarkerClick(poi),
              }}
              opacity={selectedPOI && selectedPOI.ID !== poi.ID ? 0.5 : 1}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <span
                    className="inline-block px-2 py-0.5 text-xs font-semibold text-white rounded mb-2"
                    style={{ backgroundColor: color }}
                  >
                    {poi.POIType}
                  </span>
                  <h3 className="font-bold text-lg mb-1">{poi.Name}</h3>
                  {poi.Description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {poi.Description}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Polygons */}
        {poisWithPolygons.map((poi) => {
          if (!poi.polygon?.coordinates) return null;

          const color = getTypeColor(poi.POIType);
          // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
          const positions = poi.polygon.coordinates.map((ring) =>
            toLeafletCoords(ring)
          );

          return (
            <Polygon
              key={`polygon-${poi.ID}`}
              positions={positions[0]} // First ring is the exterior
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.2,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onPOISelect(poi),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <span
                    className="inline-block px-2 py-0.5 text-xs font-semibold text-white rounded mb-2"
                    style={{ backgroundColor: color }}
                  >
                    {poi.POIType}
                  </span>
                  <h3 className="font-bold text-lg mb-1">{poi.Name}</h3>
                  {poi.Description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {poi.Description}
                    </p>
                  )}
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default POIMap;
