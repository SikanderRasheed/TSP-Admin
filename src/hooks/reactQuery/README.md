# React Query v5 Integration

This directory contains custom hooks that integrate React Query v5 with your application. React Query is a powerful library for fetching, caching, and updating data in React applications.

## Setup

To use React Query in your application, you need to wrap your application with the `QueryProvider` component:

```jsx
// In your root component (e.g., App.js or index.js)
import React from "react";
import QueryProvider from "../providers/QueryProvider";

function App() {
  return <QueryProvider>{/* Your application components */}</QueryProvider>;
}
```

## Available Hooks

### `useQuery`

Use this hook to fetch data from your API:

```jsx
import { useQuery } from "../hooks/reactQuery";

function UserProfile() {
  const { data, isLoading, error } = useQuery("get_profile", {
    // Optional parameters
    slug: "",
    params: { includeDetails: true },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => console.log("Data fetched successfully", data),
    onError: (error) => console.error("Error fetching data", error),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

### `usePaginatedQuery`

Use this hook for paginated data:

```jsx
import { usePaginatedQuery } from "../hooks/reactQuery";

function UserList() {
  const { data, isLoading, page, setPage, pageSize, setPageSize, pagination } =
    usePaginatedQuery("employee", {
      initialPage: 1,
      initialPageSize: 10,
    });

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <span>
              Page {page} of {pagination.total_pages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.total_pages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### `useMutation`

Use this hook to create, update, or delete data:

#### API Operation Patterns

For all API operations, follow these patterns:

1. **CREATE (POST)**:

   ```jsx
   // Just pass the payload directly
   mutate(payload);
   ```

2. **UPDATE (PUT)**:

   ```jsx
   // Pass the UID in the URL via slug parameter
   // Include _method: "PUT" in the payload
   mutate({
     slug: uid,
     data: {
       ...payload,
       _method: "PUT",
     },
   });
   ```

3. **DELETE**:

   ```jsx
   // Method 1: Use the delete_campus endpoint
   // Pass the UID in the URL via slug parameter
   // IMPORTANT: Do NOT include a data property for DELETE requests
   // The request body should be empty for DELETE requests
   mutate({ slug: uid });

   // Method 2: Use the campus endpoint with DELETE method (RECOMMENDED)
   // This ensures the URL will be /api/campus/uid with DELETE method
   const { mutate } = useMutation("campus", { method: "DELETE" });
   mutate({ slug: uid });
   ```

#### Example Usage

```jsx
import { useMutation } from "../hooks/reactQuery";

function CreateUserForm() {
  const { mutate, isPending, isError, error, isSuccess } = useMutation(
    "create_employee",
    {
      // Invalidate these queries after successful mutation
      invalidateQueries: ["employee"],
      onSuccess: (data) => {
        console.log("User created successfully", data);
        // Additional success handling
      },
      onError: (error) => {
        console.error("Error creating user", error);
        // Additional error handling
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      // Other form fields
    };
    mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create User"}
      </button>
      {isError && <div>Error: {error.message}</div>}
      {isSuccess && <div>User created successfully!</div>}
    </form>
  );
}
```

### `useOptimisticMutation`

Use this hook for mutations with optimistic updates:

```jsx
import { useOptimisticMutation } from "../hooks/reactQuery";
import { useQueryClient } from "@tanstack/react-query";

function TodoList() {
  const queryClient = useQueryClient();
  const { data: todos } = useQuery("todos");

  const { mutate } = useOptimisticMutation("toggle_todo", {
    invalidateQueries: ["todos"],
    optimisticUpdate: (queryClient, variables) => {
      // Update the cache optimistically
      queryClient.setQueryData(["todos"], (old) => {
        return old.map((todo) => {
          if (todo.id === variables.id) {
            return { ...todo, completed: !todo.completed };
          }
          return todo;
        });
      });
    },
  });

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => mutate({ id: todo.id })}
          />
          {todo.title}
        </li>
      ))}
    </ul>
  );
}
```

### `usePrefetch`

Use this hook to prefetch data before it's needed:

```jsx
import { usePrefetch } from "../hooks/reactQuery";

function App() {
  const { prefetchQuery, prefetchQueries } = usePrefetch();

  // Prefetch a single query
  const prefetchUserProfile = () => {
    prefetchQuery("get_profile");
  };

  // Prefetch multiple queries
  const prefetchDashboardData = () => {
    prefetchQueries([{ header: "user_type" }, { header: "employee" }]);
  };

  return (
    <div>
      <button onMouseEnter={prefetchUserProfile}>View Profile</button>
      <button onMouseEnter={prefetchDashboardData}>View Dashboard</button>
    </div>
  );
}
```

## Migrating from `useFetch`

If you're migrating from the original `useFetch` hook, you can use the compatibility layer that's provided. However, it's recommended to use the React Query hooks directly for new code.

The compatibility layer provides the same API as the original `useFetch` hook, but uses React Query internally for better performance and caching.

```jsx
// Old code using useFetch
import { useFetch } from "../hooks";

function UserProfile() {
  const { data, loading } = useFetch("get_profile", "mount");

  if (loading) return <div>Loading...</div>;

  return <div>{data.name}</div>;
}

// New code using React Query directly
import { useQuery } from "../hooks/reactQuery";

function UserProfile() {
  const { data, isLoading } = useQuery("get_profile");

  if (isLoading) return <div>Loading...</div>;

  return <div>{data.name}</div>;
}
```

## Best Practices

1. **Use Query Keys Consistently**: Query keys are used to identify and deduplicate queries. Make sure to use consistent query keys for the same data.

2. **Invalidate Queries After Mutations**: After a mutation, invalidate the relevant queries to refetch the latest data.

3. **Use Optimistic Updates**: For a better user experience, update the UI optimistically before the mutation completes.

4. **Prefetch Data**: Prefetch data before it's needed to improve perceived performance.

5. **Use the React Query DevTools**: The DevTools are automatically included in development mode and can help you debug your queries and mutations.

6. **Follow API Operation Patterns**:

   - For GET requests, use the `useQuery` or `usePaginatedQuery` hooks
   - For POST requests, use `useMutation` and pass the payload directly
   - For PUT requests, use `useMutation` with `{ slug: uid, data: { ...payload, _method: "PUT" } }`
   - For DELETE requests, use `useMutation("campus", { method: "DELETE" })` and then `mutate({ slug: uid })` (no payload needed)

7. **Pass UIDs in the URL, Not in the Payload**:
   - Always pass the UID in the URL for GET, PUT, and DELETE operations
   - Use the `slug` parameter to ensure the UID is appended to the URL
   - For DELETE operations, do NOT include a data property in the mutate call
   - DELETE requests should have an empty request body

## Key Changes in React Query v5

React Query v5 has some key differences from v4:

1. `cacheTime` has been renamed to `gcTime`
2. Improved type safety and TypeScript support
3. Better performance and smaller bundle size
4. Enhanced devtools

## Additional Resources

- [React Query v5 Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [React Query v5 Examples](https://tanstack.com/query/latest/docs/react/examples/simple)
