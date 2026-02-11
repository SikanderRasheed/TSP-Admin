# Direct React Query Usage Pattern

This guide shows how to use React Query directly in components with clean data transformation, without creating custom hooks.

## The Problem

Your API returns nested data structure:
```json
{
  "data": {
    "data": [...],  // actual event data
    "message": "All events fetched successfully", 
    "pagination": { "current_page": 1, "last_page": 2, "per_page": 10, "total": 18 }
  }
}
```

## The Solution

Use React Query's `select` option to transform the data directly in your component:

```javascript
import { useQuery } from "@/hooks/reactQuery";

function YourComponent() {
  // Direct React Query usage with clean data transformation
  const { 
    data: rawData, 
    isLoading,
    error,
    refetch 
  } = useQuery("getEvent", {
    // Performance optimizations
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - cache time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch if data exists
    
    // Transform the nested API response to clean structure
    select: (response) => {
      const apiData = response?.data;
      
      if (!apiData) {
        return {
          events: [],
          pagination: null,
        };
      }

      return {
        events: apiData.data || [], // Clean access to events array
        pagination: apiData.pagination || null, // Clean access to pagination
      };
    },
  });

  // Extract clean data - no more data.data.data!
  const events = rawData?.events || [];
  const pagination = rawData?.pagination;

  // Now use the clean data
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Events ({pagination?.total || 0} total)</h2>
      
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.date} - {event.location}</p>
        </div>
      ))}
      
      {pagination && (
        <div>
          Page {pagination.current_page} of {pagination.last_page}
        </div>
      )}
    </div>
  );
}
```

## With Filters and Search

```javascript
function EventsWithFilters() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  
  const { 
    data: rawData, 
    isLoading,
    isFetching 
  } = useQuery("getEvent", {
    params: {
      search: search.trim(),
      location: location || undefined,
    },
    enabled: search.length > 0 || location, // Only fetch when we have criteria
    staleTime: search ? 1000 : 5 * 60 * 1000, // Debounce search
    
    select: (response) => {
      const apiData = response?.data;
      return {
        events: apiData?.data || [],
        pagination: apiData?.pagination || null,
        message: apiData?.message || null,
      };
    },
  });

  const events = rawData?.events || [];
  const pagination = rawData?.pagination;

  return (
    <div>
      <input 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search events..."
      />
      <select value={location} onChange={(e) => setLocation(e.target.value)}>
        <option value="">All Locations</option>
        <option value="california">California</option>
        <option value="florida">Florida</option>
      </select>

      {isLoading && <div>Loading...</div>}
      {isFetching && !isLoading && <div>Updating...</div>}

      <div>
        {events.map(event => (
          <div key={event.id}>{event.title}</div>
        ))}
      </div>
    </div>
  );
}
```

## With Pagination

```javascript
function EventsWithPagination() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { 
    data: rawData, 
    isLoading 
  } = useQuery("getEvent", {
    params: {
      page,
      per_page: pageSize,
    },
    staleTime: 5 * 60 * 1000,
    
    select: (response) => {
      const apiData = response?.data;
      return {
        events: apiData?.data || [],
        pagination: apiData?.pagination || null,
        message: apiData?.message || null,
      };
    },
  });

  const events = rawData?.events || [];
  const pagination = rawData?.pagination;
  
  const hasNextPage = pagination?.current_page < pagination?.last_page;
  const hasPreviousPage = pagination?.current_page > 1;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
      
      <div>
        <button 
          onClick={() => setPage(p => p - 1)} 
          disabled={!hasPreviousPage || isLoading}
        >
          Previous
        </button>
        
        <span>
          Page {pagination?.current_page || 1} of {pagination?.last_page || 1}
        </span>
        
        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={!hasNextPage || isLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

## Key Benefits

✅ **No Custom Hooks** - Direct React Query usage  
✅ **Clean Data Access** - No more `data.data.data`  
✅ **High Performance** - Built-in caching and optimizations  
✅ **Flexible** - Easy to customize per component  
✅ **Simple** - Just copy the pattern where needed  

## Pattern Summary

1. Use `useQuery` directly in your component
2. Add `select` option to transform the nested API response
3. Extract clean variables: `events`, `pagination`, `message`
4. Use the clean data in your component
5. Copy this pattern to any component that needs events data

No custom hooks needed - just clean, direct usage!