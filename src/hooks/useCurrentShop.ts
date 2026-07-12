import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';

export function useCurrentShop() {
  return useQuery({
    queryKey: ['currentShop'],
    queryFn: async () => {
      const { data, error } = await supabase.from('shops').select('*').limit(1).single();
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
