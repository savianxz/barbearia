/**
 * hooks/useBarbers.ts
 * React Query hooks for the barbers resource.
 * All data fetching, mutations and cache invalidation live here.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { barbersApi, publicApi } from '../services/scheduling';
import type { CreateBarberInput, UpdateBarberInput } from '../types/scheduling';

export const BARBERS_KEY = (shopId: string) => ['barbers', shopId] as const;

export function useBarbers(shopId: string) {
  return useQuery({
    queryKey: BARBERS_KEY(shopId),
    queryFn: async () => {
      const { data, error } = await barbersApi.list(shopId);
      if (error) throw new Error(error);
      return data ?? [];
    },
    enabled: !!shopId,
  });
}

export function usePublicBarbers(shopId: string) {
  return useQuery({
    queryKey: ['publicBarbers', shopId],
    queryFn: async () => {
      const { data, error } = await publicApi.listBarbers(shopId);
      if (error) throw new Error(error);
      return data ?? [];
    },
    enabled: !!shopId,
  });
}

export function useCreateBarber(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBarberInput) => barbersApi.create(input).then(r => {
      if (r.error) throw new Error(r.error);
      return r.data!;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: BARBERS_KEY(shopId) }),
  });
}

export function useUpdateBarber(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBarberInput }) =>
      barbersApi.update(id, input).then(r => {
        if (r.error) throw new Error(r.error);
        return r.data!;
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: BARBERS_KEY(shopId) }),
  });
}

export function useDeleteBarber(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => barbersApi.delete(id).then(r => {
      if (r.error) throw new Error(r.error);
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: BARBERS_KEY(shopId) }),
  });
}

export function useToggleBarber(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      barbersApi.toggleActive(id, is_active).then(r => {
        if (r.error) throw new Error(r.error);
        return r.data!;
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: BARBERS_KEY(shopId) }),
  });
}
