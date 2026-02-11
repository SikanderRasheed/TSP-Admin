import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScopedSearchContext = createContext();

export const ScopedSearchProvider = ({ children }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const location = useLocation();

  // Define routes where search should be preserved (user detail pages)
  const preserveSearchRoutes = [
    '/profile/', // User's own profile
    '/agent/detail/' // Agent detail pages
  ];

  // Check if current route should preserve search
  const shouldPreserveSearch = (pathname) => {
    return preserveSearchRoutes.some(route => pathname.includes(route));
  };

  // Clear search when navigating to pages that shouldn't preserve search
  useEffect(() => {
    if (!shouldPreserveSearch(location.pathname)) {
      setSearchKeyword("");
    }
  }, [location.pathname]);

  return (
    <ScopedSearchContext.Provider value={{ searchKeyword, setSearchKeyword }}>
      {children}
    </ScopedSearchContext.Provider>
  );
};

export const useScopedSearch = () => useContext(ScopedSearchContext);
