import {
  useMutation as useReactMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import apiClient from "@/services/apiClient";
import api from "@/services/api";

/**
 * Simple hook for data mutations with React Query
 *
 * Usage patterns:
 *
 * CREATE (POST):
 * - mutate(payload) - Sends payload in the request body
 *
 * UPDATE (PUT):
 * - mutate({ slug: 'uid', data: { ...payload, _method: 'PUT' } })
 * - The UID is in the URL, and the payload includes _method: 'PUT'
 *
 * DELETE:
 * - mutate({ slug: 'uid' })
 * - The UID is in the URL, and no payload is needed
 *
 * @param {string} endpoint - API endpoint key from api.js
 * @param {Object} options - Mutation options
 * @returns {Object} - Mutation result object
 */
export function useMutation(endpoint, options = {}) {
  const {
    useFormData = true,
    showSuccessNotification = true,
    invalidateQueries = [],
    method, // Allow overriding the method
    headers, // Allow passing custom headers
    token, // Allow passing token for subscription endpoints
    onSuccess: userOnSuccess,
    ...mutationOptions
  } = options;
  // Get query client for cache invalidation
  const queryClient = useQueryClient();

  // Get API endpoint details
  const apiEndpoint = api[endpoint];
  if (!apiEndpoint) {
    throw new Error(`API endpoint "${endpoint}" not found`);
  }

  // Allow overriding the method from the options
  const requestMethod = method || apiEndpoint.method;

  // Memoize mutation function for React 19 performance optimization
  const mutationFn = useCallback(
    async (payload) => {
      // Handle both simple data objects and objects with data and slug properties
      const { data, slug } =
        payload && typeof payload === "object" && "data" in payload
          ? payload
          : { data: payload, slug: undefined };

      // For DELETE requests, don't include data in the request
      const isDeleteRequest = requestMethod === "DELETE";

      // Create a custom request with the specified method
      const response = await apiClient.request(endpoint, {
        // Only include data if it's not a DELETE request or if data is explicitly provided
        ...(!isDeleteRequest && { data }),
        slug,
        useFormData: !isDeleteRequest && useFormData,
        showSuccessNotification,
        method: requestMethod, // Use the overridden method
        customHeaders: headers, // Pass custom headers
        token, // Pass token for subscription endpoints
      });
      return response;
    },
    [endpoint, requestMethod, useFormData, showSuccessNotification, token]
  );

  // Memoize success handler for React 19 performance optimization
  const onSuccessHandler = useCallback(
    (data, variables, context) => {
      // Handle query invalidation
      if (typeof invalidateQueries === "function") {
        // If it's a function, call it directly with queryClient
        invalidateQueries({ data, variables }, queryClient);
      } else {
        // Use the existing handler for array/object format
        handleQueryInvalidation(invalidateQueries, queryClient, {
          data,
          variables,
        });
      }

      if (userOnSuccess) {
        userOnSuccess(data, variables, context);
      }
    },
    [invalidateQueries, queryClient, userOnSuccess]
  );

  // Use React Query's useMutation hook with React 19 optimizations
  return useReactMutation({
    mutationFn,
    onSuccess: onSuccessHandler,
    // React 19 performance optimizations
    networkMode: "online", // Only run when online
    // Pass through other options
    ...mutationOptions,
  });
}
function handleQueryInvalidation(
  invalidateQueries,
  queryClient,
  { data, variables }
) {
  if (!invalidateQueries) return;

  try {
    let queriesToInvalidate = [];

    // Handle function that returns query keys
    if (typeof invalidateQueries === "function") {
      queriesToInvalidate = invalidateQueries({ data, variables });
    }
    // Handle array of query keys
    else if (Array.isArray(invalidateQueries)) {
      queriesToInvalidate = invalidateQueries;
    }

    // Process all queries to invalidate
    if (queriesToInvalidate.length > 0) {
      queriesToInvalidate.forEach((queryItem) => {
        if (queryItem) {
          // Handle object format with queryKey, type, exact properties
          if (typeof queryItem === "object" && queryItem.queryKey) {
            const invalidateOptions = {
              queryKey: Array.isArray(queryItem.queryKey)
                ? queryItem.queryKey
                : [queryItem.queryKey],
            };

            // Add exact matching if specified
            if (queryItem.exact !== undefined) {
              invalidateOptions.exact = queryItem.exact;
            }

            // Handle type-specific invalidation
            if (queryItem.type === "paginated") {
              // For paginated queries, invalidate all queries that start with the queryKey
              invalidateOptions.predicate = (query) => {
                const queryKey = query.queryKey;
                const targetKey = invalidateOptions.queryKey;
                // Match queries that start with the same base key and have pagination parameters
                return (
                  queryKey[0] === targetKey[0] &&
                  (queryKey.length > 1 || // Has additional parameters (like pagination)
                    queryKey.some(
                      (key) => typeof key === "string" && key.includes('"page"')
                    )) // Contains pagination params
                );
              };
              // Also remove exact matching for paginated queries to catch all variants
              delete invalidateOptions.exact;
            }

            queryClient.invalidateQueries(invalidateOptions);
          }
          // Handle simple string or array query keys
          else {
            queryClient.invalidateQueries({
              queryKey: Array.isArray(queryItem) ? queryItem : [queryItem],
            });
          }
        }
      });
    }
  } catch (error) {
    console.error("Error during query invalidation:", error);
  }
}
export default useMutation;
