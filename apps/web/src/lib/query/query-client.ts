import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

// Singleton used by repositories for cache invalidation (invalidateQueries).
// This is separate from the per-render client created inside QueryProvider.
export const queryClient = makeQueryClient();
