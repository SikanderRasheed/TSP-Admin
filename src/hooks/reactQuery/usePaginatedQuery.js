import { useState, useMemo, useCallback } from "react";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import api from "@/services/api";

/**
 * Enhanced hook for paginated data fetching with Facebook-like performance
 * 
 * @param {string} endpoint - API endpoint key from api.js
 * @param {Object} options - Query options
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @param {number} options.initialPageSize - Initial page size (default: 10)
 * @param {Object} options.params - Additional query parameters
 * @param {boolean} options.keepPreviousData - Keep previous data while loading new page (default: true)
 * @param {boolean} options.enabled - Whether the query is enabled (default: true)
 * @param {number} options.staleTime - How long data stays fresh (default: 5 minutes)
 * @param {number} options.gcTime - Cache time (default: 10 minutes)
 * @returns {Object} - Enhanced query result with pagination controls
 */
export function usePaginatedQuery(endpoint, options = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    params: additionalParams = {},
    keepPreviousData = true,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes
    showSuccessNotification = false,
    slug,
    token,
    ...queryOptions
  } = options;

  // Pagination state
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Get API endpoint details
  const apiEndpoint = api[endpoint];
  if (!apiEndpoint) {
    throw new Error(`API endpoint "${endpoint}" not found`);
  }

  // Combine pagination params with additional params
  const params = useMemo(() => ({
    ...additionalParams,
    page,
    per_page: pageSize, // Use per_page as specified
  }), [additionalParams, page, pageSize]);

  // Stable query key generation
  const queryKey = useMemo(() => {
    const key = [endpoint, 'paginated'];
    if (slug) key.push(slug);
    if (params && Object.keys(params).length > 0) {
      // Create stable key from params - sort keys to ensure consistency
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc, key) => {
          acc[key] = params[key];
          return acc;
        }, {});
      key.push(JSON.stringify(sortedParams));
    }
    return key;
  }, [endpoint, slug, params]);

  // Query function
  const queryFn = useMemo(() => {
    return async () => {
      try {
        const response = await apiClient.request(endpoint, {
          params,
          slug,
          showSuccessNotification,
          token,
        });
        return response;
      } catch (error) {
        throw error;
      }
    };
  }, [endpoint, slug, params, showSuccessNotification, token]);

  // Data transformation for GET requests
  const select = useMemo(() => {
    return (response) => {
      // If user provided a custom select function, use it
      if (queryOptions.select) {
        return queryOptions.select(response);
      }

      // For GET requests, automatically extract the nested data structure
      if (apiEndpoint.method === 'GET') {
        const apiData = response?.data;

        if (!apiData) {
          return {
            data: [],
            pagination: response?.pagination || null,
            meta: response?.meta || null,
          };
        }

        // Handle the common API response structure
        return {
          data: apiData.data || [], // Extract the actual data array
          pagination: apiData.pagination || response?.pagination || null, // Extract pagination
          meta: apiData.meta || response?.meta || null, // Extract meta information
        };
      }

      // For non-GET requests, return as-is
      return response;
    };
  }, [queryOptions.select, apiEndpoint.method]);

  // React Query with performance optimizations
  const query = useReactQuery({
    queryKey,
    queryFn,
    select,
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Facebook-like performance: keep previous data while loading
    placeholderData: keepPreviousData ? (previousData) => previousData : undefined,
    // Only re-render on specific prop changes for better performance
    notifyOnChangeProps: ["data", "error", "isLoading", "isFetching"],
    // Pass through additional options
    ...Object.fromEntries(
      Object.entries(queryOptions).filter(([key]) => 
        !['select', 'enabled', 'staleTime', 'gcTime'].includes(key)
      )
    ),
  });

  // Pagination helpers with performance optimizations
  const paginationHelpers = useMemo(() => {
    const paginationData = query.data?.pagination || {};
    
    return {
      // Current pagination info
      currentPage: page,
      pageSize,
      totalItems: paginationData.totalCount || paginationData.total || 0,
      totalPages: paginationData.totalPages || Math.ceil((paginationData.totalCount || 0) / pageSize),
      
      // Navigation helpers
      hasNextPage: page < (paginationData.totalPages || Math.ceil((paginationData.totalCount || 0) / pageSize)),
      hasPreviousPage: page > 1,
      
      // Page range for pagination component
      pageRange: {
        start: Math.max(1, page - 2),
        end: Math.min(
          paginationData.totalPages || Math.ceil((paginationData.totalCount || 0) / pageSize),
          page + 2
        ),
      },
    };
  }, [query.data?.pagination, page, pageSize]);

  // Optimized navigation functions
  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= paginationHelpers.totalPages && newPage !== page) {
      setPage(newPage);
    }
  }, [page, paginationHelpers.totalPages]);

  const nextPage = useCallback(() => {
    if (paginationHelpers.hasNextPage) {
      setPage(prev => prev + 1);
    }
  }, [paginationHelpers.hasNextPage]);

  const prevPage = useCallback(() => {
    if (paginationHelpers.hasPreviousPage) {
      setPage(prev => prev - 1);
    }
  }, [paginationHelpers.hasPreviousPage]);

  const changePageSize = useCallback((newPageSize) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1); // Reset to first page when changing page size
    }
  }, [pageSize]);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  // Return enhanced query result with pagination
  return {
    // Original query data
    ...query,
    
    // Pagination state
    page,
    pageSize,
    
    // Pagination data
    ...paginationHelpers,
    
    // Navigation functions
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    resetPagination,
    
    // Convenience getters
    items: query.data?.data || [],
    pagination: query.data?.pagination || {},
    meta: query.data?.meta || {},
    
    // Loading states for better UX
    isLoadingFirstPage: query.isLoading && page === 1,
    isLoadingNewPage: query.isFetching && !query.isLoading,
  };
}

export default usePaginatedQuery;