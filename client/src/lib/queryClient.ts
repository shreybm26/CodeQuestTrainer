import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Generic apiRequest function that returns the JSON data
export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json() as T;
}

// Function for making API POST requests
export async function apiPost<T = any>(
  url: string,
  data: any
): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

// Function for making API GET requests
export async function apiGet<T = any>(
  url: string
): Promise<T> {
  return apiRequest<T>(url);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // Parse the response
    const data = await res.json();
    
    // Check if we're expecting an array but got something else
    // This prevents the "o.map is not a function" error
    if (Array.isArray(data)) {
      return data;
    } else if (data === null) {
      // If the data is null, return an empty array to prevent null.map errors
      console.warn(`API returned null for query ${queryKey[0]}, defaulting to empty array`);
      return [] as any;
    } else if (typeof data === 'object') {
      // Return the object as is for object responses
      return data;
    } else {
      // For all other cases, log and return the data
      console.warn(`Unexpected data type for query ${queryKey[0]}`);
      return data;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
