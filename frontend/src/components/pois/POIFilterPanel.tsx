import React from "react";

interface POIFilterPanelProps {
  selectedType: string | null;
  types: string[];
  onTypeChange: (type: string | null) => void;
}

const POIFilterPanel: React.FC<POIFilterPanelProps> = ({
  selectedType,
  types,
  onTypeChange,
}) => {
  return (
    <aside
      className="w-full space-y-4"
      role="complementary"
      aria-label="Filtry POI"
    >
      <div>
        <h3 className="block text-sm font-semibold text-gray-700 mb-3">
          Typ obiektu
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTypeChange(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedType === null
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
            aria-label="Wszystkie typy"
            aria-pressed={selectedType === null}
          >
            Wszystkie
          </button>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                selectedType === type
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
              aria-label={`Filtruj: ${type}`}
              aria-pressed={selectedType === type}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter indicator */}
      {selectedType && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Aktywny filtr:{" "}
            <span className="font-semibold text-blue-600 capitalize">
              {selectedType}
            </span>
          </p>
        </div>
      )}
    </aside>
  );
};

export default POIFilterPanel;
