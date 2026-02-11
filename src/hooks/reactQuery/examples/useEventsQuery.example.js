/**
 * USAGE EXAMPLES FOR useEventsQuery
 * 
 * This file demonstrates how to use the clean events query structure
 * in your React components. Copy these patterns into your actual components.
 */

import React, { useState } from "react";
import { useEventsQuery, usePaginatedEventsQuery } from "@/hooks/reactQuery";

// ============================================================================
// EXAMPLE 1: Basic Events Query
// ============================================================================
function BasicEventsExample() {
  const { 
    events,           // Direct access to events array
    pagination,       // Direct access to pagination object
    message,          // Direct access to message
    isLoading,
    error,
    hasNextPage,
    totalItems
  } = useEventsQuery({
    // Optional: Add filters
    params: {
      category: "automotive",
      location: "california"
    }
  });

  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Events ({totalItems} total)</h2>
      {message && <p>{message}</p>}
      
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.date}</p>
          <p>{event.location}</p>
        </div>
      ))}
      
      {/* Pagination info */}
      {pagination && (
        <div>
          Page {pagination.current_page} of {pagination.last_page}
          {hasNextPage && <button>Load More</button>}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Events with Search and Filters
// ============================================================================
function EventsWithFiltersExample() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const { 
    events,
    pagination,
    isLoading,
    isFetching, // Shows when refetching due to filter changes
    totalItems
  } = useEventsQuery({
    params: {
      search: search.trim(),
      location: location || undefined,
      category: category || undefined,
    },
    // Only fetch when we have some criteria
    enabled: search.length > 0 || location || category,
    // Debounce search by adding staleTime
    staleTime: search ? 1000 : 5 * 60 * 1000, // 1 second for search, 5 minutes for others
  });

  return (
    <div>
      {/* Filters */}
      <div>
        <input 
          type="text" 
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All Locations</option>
          <option value="california">California</option>
          <option value="florida">Florida</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="automotive">Automotive</option>
          <option value="meetup">Meetup</option>
        </select>
      </div>

      {/* Loading states */}
      {isLoading && <div>Loading...</div>}
      {isFetching && !isLoading && <div>Updating...</div>}

      {/* Results */}
      <div>
        <h2>Events ({totalItems} found)</h2>
        {events.map(event => (
          <div key={event.id}>
            <h3>{event.title}</h3>
            <p>{event.date} - {event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Paginated Events (Recommended for large datasets)
// ============================================================================
function PaginatedEventsExample() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({});

  const { 
    events,
    pagination,
    isLoading,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    totalPages,
    currentPage
  } = usePaginatedEventsQuery({
    initialPage: page,
    initialPageSize: pageSize,
    filters,
  });

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPreviousPage) {
      setPage(prev => prev - 1);
    }
  };

  return (
    <div>
      <h2>Events (Page {currentPage} of {totalPages})</h2>
      
      {isLoading ? (
        <div>Loading events...</div>
      ) : (
        <>
          {/* Events List */}
          <div>
            {events.map(event => (
              <div key={event.id}>
                <h3>{event.title}</h3>
                <p>{event.date} - {event.location}</p>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div>
            <button 
              onClick={handlePrevPage} 
              disabled={!hasPreviousPage || isLoading}
            >
              Previous
            </button>
            
            <span>
              Page {currentPage} of {totalPages} 
              ({totalItems} total events)
            </span>
            
            <button 
              onClick={handleNextPage} 
              disabled={!hasNextPage || isLoading}
            >
              Next
            </button>
          </div>

          {/* Page Size Selector */}
          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1); // Reset to first page
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Performance Optimized Events (For high-traffic components)
// ============================================================================
function PerformanceOptimizedEventsExample() {
  const { 
    events,
    pagination,
    isLoading,
    error
  } = useEventsQuery({
    // Performance optimizations
    staleTime: 10 * 60 * 1000,      // 10 minutes - data stays fresh longer
    gcTime: 30 * 60 * 1000,         // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false,     // Don't refetch on window focus
    refetchOnMount: false,           // Don't refetch if data exists
    refetchOnReconnect: false,       // Don't refetch on reconnect
    
    // Only re-render on specific changes
    notifyOnChangeProps: ["data", "error", "isLoading"],
    
    // Optional: Add retry logic
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Memoize expensive computations
  const featuredEvents = React.useMemo(() => 
    events.filter(event => event.featured), 
    [events]
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Featured Events ({featuredEvents.length})</h2>
      {featuredEvents.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.date}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Events with Real-time Updates
// ============================================================================
function RealTimeEventsExample() {
  const { 
    events,
    pagination,
    isLoading,
    refetch
  } = useEventsQuery({
    // Shorter stale time for real-time feel
    staleTime: 30 * 1000,           // 30 seconds
    refetchInterval: 60 * 1000,     // Refetch every minute
    refetchIntervalInBackground: true, // Continue refetching in background
  });

  return (
    <div>
      <div>
        <h2>Live Events</h2>
        <button onClick={() => refetch()}>
          Refresh Now
        </button>
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {events.map(event => (
            <div key={event.id}>
              <h3>{event.title}</h3>
              <p>{event.date} - {event.location}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export {
  BasicEventsExample,
  EventsWithFiltersExample,
  PaginatedEventsExample,
  PerformanceOptimizedEventsExample,
  RealTimeEventsExample,
};