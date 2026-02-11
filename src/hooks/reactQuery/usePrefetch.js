import { useQueryClient } from '@tanstack/react-query';
import ApiClient from '@/services/apiClient';

/**
 * Custom hook for prefetching data with React Query
 *
 * @returns {Object} - Object with prefetch functions
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  /**
   * Prefetch a single query
   *
   * @param {string} header - API endpoint key from api.js
   * @param {Object} options - Prefetch options
   * @param {string} options.slug - Optional URL slug to append
   * @param {Object} options.queryParams - Query parameters to append to the URL
   * @param {number} options.staleTime - Custom stale time in milliseconds
   * @param {Array} options.dependencies - Additional dependencies for the query key
   */
  const prefetchQuery = async (header, options = {}) => {
    const {
      slug = '',
      queryParams = null,
      staleTime,
      dependencies = [],
    } = options;

    // Create a stable query key
    const queryKey = [header, slug, queryParams, ...dependencies];

    // Prefetch the query with v5 API
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: () => ApiClient.fetchData(header, slug, queryParams),
      staleTime,
    });
  };

  /**
   * Prefetch multiple queries
   *
   * @param {Array} queries - Array of query configurations
   */
  const prefetchQueries = async (queries = []) => {
    await Promise.all(
      queries.map(({ header, ...options }) => prefetchQuery(header, options))
    );
  };

  return {
    prefetchQuery,
    prefetchQueries,
  };
}

export default usePrefetch;
