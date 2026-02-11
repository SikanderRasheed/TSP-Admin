import { QueryClient } from "@tanstack/react-query";

// Create a client optimized to PREVENT multiple API calls
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // CRITICAL: Prevent multiple API calls
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: false, // Don't refetch when network reconnects (initially)
      refetchOnMount: false, // Don't refetch when component mounts if data exists

      // Smart retry logic - don't retry on 4xx errors
      retry: (failureCount, error) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1; // Only retry once to prevent multiple calls
      },
      retryDelay: 2000, // Fixed 2 second delay instead of exponential backoff

      // Aggressive caching to prevent re-fetching
      staleTime: 10 * 60 * 1000, // Data is fresh for 10 minutes (increased)
      gcTime: 30 * 60 * 1000, // Cache data for 30 minutes (increased)

      // React 19 optimizations
      networkMode: "online", // Only run queries when online
      notifyOnChangeProps: ["data", "error", "isLoading"], // Only re-render on essential changes

      // Performance improvements
      structuralSharing: true, // Enable structural sharing for better performance
      throwOnError: false, // Handle errors gracefully
    },
    mutations: {
      // CRITICAL: Prevent double mutation calls
      retry: false, // Never retry mutations to prevent double calls
      retryDelay: 0, // No delay
      networkMode: "online", // Only run mutations when online

      // React 19 optimizations
      throwOnError: false, // Handle errors gracefully
    },
  },
});

export default queryClient;
