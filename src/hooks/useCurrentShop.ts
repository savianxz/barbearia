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
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
