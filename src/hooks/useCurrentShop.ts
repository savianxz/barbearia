import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../services/scheduling';

export function useCurrentShop(slug?: string) {
  return useQuery({
    queryKey: ['currentShop', slug],
    queryFn: async () => {
      const { data, error } = await publicApi.getShop(undefined, slug);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!slug,             // never fire without a slug
    retry: false,                // don't retry — null result is not a transient error
    staleTime: 1000 * 60 * 60,  // 1 hour
    refetchOnWindowFocus: false, // prevent flash of "not found" when switching tabs
  });
}

