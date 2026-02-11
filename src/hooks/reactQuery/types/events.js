/**
 * Type definitions and interfaces for Events API
 * These JSDoc types provide IntelliSense support in VS Code
 */

/**
 * @typedef {Object} EventItem
 * @property {string|number} id - Unique event identifier
 * @property {string} title - Event title
 * @property {string} date - Event date
 * @property {string} location - Event location
 * @property {string} [image] - Event image URL
 * @property {string[]} [avatars] - Array of avatar URLs
 * @property {boolean} [featured] - Whether event is featured
 * @property {string} [category] - Event category
 * @property {string} [description] - Event description
 * @property {Object} [organizer] - Event organizer details
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} current_page - Current page number
 * @property {number} last_page - Total number of pages
 * @property {number} per_page - Items per page
 * @property {number} total - Total number of items
 * @property {number} [from] - First item number on current page
 * @property {number} [to] - Last item number on current page
 */

/**
 * @typedef {Object} EventsApiResponse
 * @property {EventItem[]} data - Array of events
 * @property {string} message - API response message
 * @property {PaginationInfo} pagination - Pagination information
 */

/**
 * @typedef {Object} TransformedEventsData
 * @property {EventItem[]} events - Array of events (clean access)
 * @property {PaginationInfo|null} pagination - Pagination object
 * @property {string|null} message - API message
 */

/**
 * @typedef {Object} EventsQueryOptions
 * @property {Object} [params] - Query parameters
 * @property {string} [params.search] - Search query
 * @property {string} [params.location] - Location filter
 * @property {string} [params.category] - Category filter
 * @property {string} [params.date] - Date filter
 * @property {number} [params.page] - Page number
 * @property {number} [params.per_page] - Items per page
 * @property {boolean} [enabled] - Whether query should run
 * @property {number} [staleTime] - How long data stays fresh (ms)
 * @property {number} [gcTime] - Cache time (ms)
 * @property {boolean} [refetchOnWindowFocus] - Refetch on window focus
 * @property {boolean} [refetchOnMount] - Refetch on component mount
 * @property {number} [refetchInterval] - Auto-refetch interval (ms)
 * @property {boolean} [refetchIntervalInBackground] - Continue refetching in background
 * @property {number} [retry] - Number of retry attempts
 * @property {Function} [retryDelay] - Retry delay function
 * @property {string[]} [notifyOnChangeProps] - Props that trigger re-renders
 */

/**
 * @typedef {Object} EventsQueryResult
 * @property {TransformedEventsData} data - Transformed events data
 * @property {EventItem[]} events - Direct access to events array
 * @property {PaginationInfo|null} pagination - Direct access to pagination
 * @property {string|null} message - Direct access to message
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isFetching - Fetching state
 * @property {boolean} isError - Error state
 * @property {Error|null} error - Error object
 * @property {boolean} isSuccess - Success state
 * @property {Function} refetch - Function to refetch data
 * @property {boolean} hasNextPage - Whether there's a next page
 * @property {boolean} hasPreviousPage - Whether there's a previous page
 * @property {number} totalItems - Total number of items
 * @property {number} currentPage - Current page number
 * @property {number} totalPages - Total number of pages
 * @property {number} itemsPerPage - Items per page
 */

/**
 * @typedef {Object} PaginatedEventsOptions
 * @property {number} [initialPage] - Initial page number
 * @property {number} [initialPageSize] - Initial page size
 * @property {Object} [filters] - Additional filters
 * @property {string} [search] - Search query
 * @property {EventsQueryOptions} [...restOptions] - Other query options
 */

/**
 * @typedef {Object} PaginatedEventsResult
 * @property {EventsQueryResult} [...queryResult] - All query result properties
 * @property {number} currentPage - Current page (read-only)
 * @property {number} pageSize - Page size (read-only)
 * @property {string} search - Search query (read-only)
 * @property {Object} filters - Applied filters (read-only)
 */

// Export empty object to make this a module
export {};