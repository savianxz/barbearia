import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';

export function useRealtimeAppointments(shopId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel('public:appointments')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'appointments',
          filter: `shop_id=eq.${shopId}`,
        },
        (payload) => {
          console.log('Realtime Update Received:', payload);
          // Invalida a query de agendamentos para forçar o recarregamento
          // Como as queries no React Query usam 'appointments', shopId, start, end,
          // invalidar com prefixo 'appointments', shopId vai re-buscar tudo que estiver ativo.
          queryClient.invalidateQueries({ queryKey: ['appointments', shopId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, queryClient]);
}
