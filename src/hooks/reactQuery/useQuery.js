import { useState, useMemo, useCallback } from "react";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import api from "@/services/api";

/**
 * Simple hook for data fetching with React Query and optional pagination
 *
 * @param {string} endpoint - API endpoint key from api.js
 * @param {Object} options - Query options
 * @param {boolean} options.enablePagination - Enable pagination support
 * @param {Object} options.defaultQueryParams - Default query parameters (including page, limit)
 * @returns {Object} - Query result object with pagination support
 */
export function useQuery(endpoint, options = {}) {
  // Extract options with defaults
  const { 
    params, 
    slug, 
    showSuccessNotification = false, 
    token,
    enablePagination = false,
    defaultQueryParams = {},
    ...queryOptions 
  } = options;

  // Pagination state (only if pagination is enabled)
  const [queryParams, setQueryParams] = useState(defaultQueryParams);

  // Get API endpoint details
  const apiEndpoint = api[endpoint];
  if (!apiEndpoint) {
    throw new Error(`API endpoint "${endpoint}" not found`);
  }

  // Combine params with query params for pagination
  const finalParams = useMemo(() => {
    if (enablePagination) {
      return {
        ...params,
        ...queryParams,
      };
    }
    return params;
  }, [params, queryParams, enablePagination]);

  // Stable query key generation
  const queryKey = useMemo(() => {
    const key = [endpoint];
    if (slug) key.push(slug);
    if (finalParams && Object.keys(finalParams).length > 0) {
      // Create stable key from params - sort keys to ensure consistency
      const sortedParams = Object.keys(finalParams)
        .sort()
        .reduce((acc, key) => {
          acc[key] = finalParams[key];
          return acc;
        }, {});
      key.push(JSON.stringify(sortedParams));
    }
    return key;
  }, [endpoint, slug, finalParams]);

  // Query function
  const queryFn = useMemo(() => {
    return async () => {
      try {
        const response = await apiClient.request(endpoint, {
          params: finalParams,
          slug,
          showSuccessNotification,
          token,
        });
        return response;
      } catch (error) {
        throw error;
      }
    };
  }, [endpoint, slug, finalParams, showSuccessNotification, token]);

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
            pagination: null,
          };
        }

        // Handle your server response structure: { data: [...], pagination: {...} }
        return {
          data: apiData.data || [], // Extract the actual data array
          pagination: apiData.pagination || null, // Extract pagination info
          message: apiData.message || null,
          status: apiData.status || null,
        };
      }

      // For non-GET requests, return as-is
      return response;
    };
  }, [queryOptions.select, apiEndpoint.method]);

  // React Query with optimizations
  const query = useReactQuery({
    queryKey,
    queryFn,
    select,
    enabled: queryOptions.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    // Keep previous data for smooth pagination
    placeholderData: enablePagination ? (previousData) => previousData : undefined,
    // Pass through other options
    ...Object.fromEntries(
      Object.entries(queryOptions).filter(([key]) => 
        !['select', 'enabled'].includes(key)
      )
    ),
  });

  // Pagination helpers (only if pagination is enabled)
  const paginationHelpers = useMemo(() => {
    if (!enablePagination) return {};

    const paginationData = query.data?.pagination || {};
    
    return {
      pagination: {
        currentPage: paginationData.current_page || 1,
        lastPage: paginationData.last_page || 1,
        perPage: paginationData.per_page || 10,
        total: paginationData.total || 0,
        count: paginationData.total || 0, // Alias for total
      },
      setQueryParams,
      fetchApi: query.refetch, // Alias for refetch
    };
  }, [enablePagination, query.data?.pagination, query.refetch]);

  // Return the appropriate structure based on pagination
  if (enablePagination) {
    return {
      loading: query.isLoading,
      data: query.data?.data || [],
      error: query.error,
      isError: query.isError,
      refetch: query.refetch,
      ...paginationHelpers,
    };
  }

  // Standard return for non-paginated queries
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch,
    // Keep original structure for backward compatibility
    ...query,
  };
}

/**
 * @deprecated Use useQuery with enablePagination: true instead
 */
export function usePaginatedQuery(endpoint, options = {}) {
  console.warn('usePaginatedQuery is deprecated. Use useQuery with enablePagination: true instead.');
  
  return useQuery(endpoint, {
    ...options,
    enablePagination: true,
    defaultQueryParams: {
      page: options.initialPage || 1,
      limit: options.initialPageSize || 10,
      ...options.defaultQueryParams,
    },
  });
}

export default useQuery;