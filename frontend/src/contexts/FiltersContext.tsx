import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { EventFilters } from '../types/event';

interface FiltersContextType {
  filters: EventFilters;
  setFilters: (filters: EventFilters) => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<EventFilters>({
    radius: 25,
  });

  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};
