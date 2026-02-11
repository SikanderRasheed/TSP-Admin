import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const updateFilters = (newFilters) => {
    setFilters(newFilters); // Replace instead of merge
  };

  const clearFilters = () => {
    setFilters({}); // Clear filters
  };

  return (
    <FilterContext.Provider
      value={{
        filters,
        updateFilters,
        clearFilters,
        isFilterModalOpen,
        setIsFilterModalOpen,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => useContext(FilterContext);
