import React from 'react';
import type { EventFilters, EventCategory, PriceType } from '../../types/event';

interface FilterPanelProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const categories: { value: EventCategory | ''; label: string }[] = [
    { value: '', label: 'Wszystkie kategorie' },
    { value: 'CONCERT', label: 'Koncerty' },
    { value: 'FESTIVAL', label: 'Festiwale' },
    { value: 'THEATRE', label: 'Teatr' },
    { value: 'CINEMA', label: 'Kino' },
    { value: 'WORKSHOP', label: 'Warsztaty' },
    { value: 'FOOD', label: 'Gastronomia' },
    { value: 'CULTURAL', label: 'Kultura' },
  ];

  const priceTypes: { value: PriceType | ''; label: string }[] = [
    { value: '', label: 'Wszystkie' },
    { value: 'FREE', label: 'Darmowe' },
    { value: 'PAID', label: 'Płatne' },
  ];

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category as EventCategory | undefined,
    });
  };

  const handlePriceTypeChange = (priceType: string) => {
    onFiltersChange({
      ...filters,
      price_type: priceType as PriceType | undefined,
    });
  };

  const handleRadiusChange = (radius: number) => {
    onFiltersChange({
      ...filters,
      radius,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      radius: 25,
    });
  };

  return (
    <aside
      className="w-full space-y-3"
      role="complementary"
      aria-label="Filtry wydarzeń"
    >

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">
          Kategoria
        </label>
        <select
          id="category"
          value={filters.category || ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          aria-label="Wybierz kategorię"
        >
          {categories.map((cat) => (
            <option key={cat.value || 'all'} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Price Type */}
      <div>
        <label htmlFor="price-type" className="block text-sm font-semibold text-gray-700 mb-1">
          Cena
        </label>
        <select
          id="price-type"
          value={filters.price_type || ''}
          onChange={(e) => handlePriceTypeChange(e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          aria-label="Wybierz typ ceny"
        >
          {priceTypes.map((type) => (
            <option key={type.value || 'all'} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Radius Slider */}
      <div>
        <label htmlFor="radius" className="block text-sm font-semibold text-gray-700 mb-1">
          Odległość: <span className="text-blue-600">{filters.radius || 25} km</span>
        </label>
        <input
          id="radius"
          type="range"
          min="5"
          max="100"
          step="5"
          value={filters.radius || 25}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          aria-label="Wybierz promień wyszukiwania"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 km</span>
          <span>100 km</span>
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label htmlFor="date-from" className="block text-sm font-semibold text-gray-700 mb-1">
          Zakres dat
        </label>
        <div className="space-y-2">
          <input
            id="date-from"
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => onFiltersChange({ ...filters, date_from: e.target.value || undefined })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            aria-label="Data od"
          />
          <input
            id="date-to"
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => onFiltersChange({ ...filters, date_to: e.target.value || undefined })}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            aria-label="Data do"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="pt-2 border-t border-gray-200">
        <button
          onClick={handleClearFilters}
          className="w-full px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label="Wyczyść filtry"
        >
          Wyczyść wszystkie filtry
        </button>
      </div>

      {/* Active Filters Count */}
      {Object.keys(filters).filter(key => key !== 'radius' && filters[key as keyof EventFilters]).length > 0 && (
        <div className="pt-2 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-600">
            Aktywne filtry:{' '}
            <span className="font-semibold text-blue-600">
              {Object.keys(filters).filter(key => key !== 'radius' && filters[key as keyof EventFilters]).length}
            </span>
          </p>
        </div>
      )}
    </aside>
  );
};

export default FilterPanel;
