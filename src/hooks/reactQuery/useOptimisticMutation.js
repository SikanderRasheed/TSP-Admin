import {
  useMutation as useReactMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo, useOptimistic } from "react";
import apiClient from "@/services/apiClient";
import api from "@/services/api";

/**
 * React 19 Optimistic Mutation Hook
 *
 * This hook leverages React 19's useOptimistic hook for immediate UI updates
 * while the actual mutation is in progress, providing a better user experience.
 *
 * Usage patterns:
 *
 * CREATE (POST):
 * - mutate(payload) - Sends payload in the request body
 *
 * UPDATE (PUT):
 * - mutate({ slug: 'uid', data: { ...payload, _method: 'PUT' } })
 *
 * DELETE:
 * - mutate({ slug: 'uid' })
 *
 * @param {string} endpoint - API endpoint key from api.js
 * @param {Object} options - Mutation options
 * @param {Function} options.optimisticUpdate - Function to apply optimistic update
 * @param {Array} options.invalidateQueries - Queries to invalidate on success
 * @returns {Object} - Mutation result object with optimistic state
 */
export function useOptimisticMutation(endpoint, options = {}) {
  const {
    optimisticUpdate,
    invalidateQueries = [],
    useFormData = false,
    showSuccessNotification = false,
    method,
    onSuccess: userOnSuccess,
    onError: userOnError,
    ...mutationOptions
  } = options;

  const queryClient = useQueryClient();

  // Get API endpoint details
  const apiEndpoint = api[endpoint];
  if (!apiEndpoint) {
    throw new Error(`API endpoint "${endpoint}" not found`);
  }

  const requestMethod = method || apiEndpoint.method;

  // React 19's useOptimistic hook for immediate UI updates
  const [optimisticState, addOptimistic] = useOptimistic(
    null,
    (state, optimisticValue) => optimisticValue
  );

  // Memoized mutation function for React 19 performance
  const mutationFn = useCallback(
    async (payload) => {
      const { data, slug } =
        payload && typeof payload === "object" && "data" in payload
          ? payload
          : { data: payload, slug: undefined };

      const isDeleteRequest = requestMethod === "DELETE";

      const response = await apiClient.request(endpoint, {
        ...(!isDeleteRequest && { data }),
        slug,
        useFormData: !isDeleteRequest && useFormData,
        showSuccessNotification,
        method: requestMethod,
      });
      return response;
    },
    [endpoint, requestMethod, useFormData, showSuccessNotification]
  );

  // Memoized optimistic update function
  const applyOptimisticUpdate = useCallback(
    (variables) => {
      if (optimisticUpdate && typeof optimisticUpdate === "function") {
        const optimisticData = optimisticUpdate(variables);
        addOptimistic(optimisticData);
        return optimisticData;
      }
      return null;
    },
    [optimisticUpdate, addOptimistic]
  );

  // Memoized success handler
  const onSuccessHandler = useCallback(
    (data, variables, context) => {
      // Clear optimistic state on success
      addOptimistic(null);

      // Invalidate queries
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({
            queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
          });
        });
      }

      if (userOnSuccess) {
        userOnSuccess(data, variables, context);
      }
    },
    [invalidateQueries, queryClient, userOnSuccess, addOptimistic]
  );

  // Memoized error handler
  const onErrorHandler = useCallback(
    (error, variables, context) => {
      // Clear optimistic state on error
      addOptimistic(null);

      if (userOnError) {
        userOnError(error, variables, context);
      }
    },
    [userOnError, addOptimistic]
  );

  // React Query mutation with React 19 optimizations
  const mutation = useReactMutation({
    mutationFn,
    onMutate: applyOptimisticUpdate, // Apply optimistic update immediately
    onSuccess: onSuccessHandler,
    onError: onErrorHandler,
    networkMode: "online",
    ...mutationOptions,
  });

  // Enhanced mutate function that applies optimistic updates
  const optimisticMutate = useCallback(
    (variables, options = {}) => {
      // Apply optimistic update immediately
      applyOptimisticUpdate(variables);

      // Execute the actual mutation
      return mutation.mutate(variables, options);
    },
    [mutation.mutate, applyOptimisticUpdate]
  );

  // Enhanced mutateAsync function
  const optimisticMutateAsync = useCallback(
    (variables, options = {}) => {
      // Apply optimistic update immediately
      applyOptimisticUpdate(variables);

      // Execute the actual mutation
      return mutation.mutateAsync(variables, options);
    },
    [mutation.mutateAsync, applyOptimisticUpdate]
  );

  // Return enhanced mutation object with optimistic state
  return useMemo(
    () => ({
      ...mutation,
      mutate: optimisticMutate,
      mutateAsync: optimisticMutateAsync,
      optimisticState,
      isOptimistic: optimisticState !== null,
    }),
    [mutation, optimisticMutate, optimisticMutateAsync, optimisticState]
  );
}

/**
 * Helper function to create optimistic update functions for common patterns
 */
export const createOptimisticUpdaters = {
  // For adding items to a list
  addToList: (queryKey, newItem) => (variables) => {
    const queryClient = useQueryClient();
    const previousData = queryClient.getQueryData(queryKey);

    if (previousData?.data) {
      queryClient.setQueryData(queryKey, {
        ...previousData,
        data: [
          ...previousData.data,
          { ...newItem, ...variables, id: Date.now() },
        ],
      });
    }

    return { type: "add", item: newItem };
  },

  // For updating items in a list
  updateInList: (queryKey, itemId) => (variables) => {
    const queryClient = useQueryClient();
    const previousData = queryClient.getQueryData(queryKey);

    if (previousData?.data) {
      queryClient.setQueryData(queryKey, {
        ...previousData,
        data: previousData.data.map((item) =>
          item.id === itemId ? { ...item, ...variables } : item
        ),
      });
    }

    return { type: "update", itemId, changes: variables };
  },

  // For removing items from a list
  removeFromList: (queryKey, itemId) => (variables) => {
    const queryClient = useQueryClient();
    const previousData = queryClient.getQueryData(queryKey);

    if (previousData?.data) {
      queryClient.setQueryData(queryKey, {
        ...previousData,
        data: previousData.data.filter((item) => item.id !== itemId),
      });
    }

    return { type: "remove", itemId };
  },
};

export default useOptimisticMutation;
