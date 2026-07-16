/**
 * hooks/useServices.ts
 * React Query hooks for the services resource.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi, publicApi } from '../services/scheduling';
import type { CreateServiceInput, UpdateServiceInput } from '../types/scheduling';

export const SERVICES_KEY = (shopId: string) => ['services', shopId] as const;

export function useServices(shopId: string) {
  return useQuery({
    queryKey: SERVICES_KEY(shopId),
    queryFn: async () => {
      const { data, error } = await servicesApi.list(shopId);
      if (error) throw new Error(error);
      return data ?? [];
    },
    enabled: !!shopId,
  });
}

export function usePublicServices(shopId: string) {
  return useQuery({
    queryKey: ['publicServices', shopId],
    queryFn: async () => {
      const { data, error } = await publicApi.listServices(shopId);
      if (error) throw new Error(error);
      return data ?? [];
    },
    enabled: !!shopId,
  });
}

export function useCreateService(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceInput) => servicesApi.create(input).then(r => {
      if (r.error) throw new Error(r.error);
      return r.data!;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY(shopId) }),
  });
}

export function useUpdateService(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateServiceInput }) =>
      servicesApi.update(id, input).then(r => {
        if (r.error) throw new Error(r.error);
        return r.data!;
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY(shopId) }),
  });
}

export function useDeleteService(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.delete(id).then(r => {
      if (r.error) throw new Error(r.error);
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY(shopId) }),
  });
}

export function useToggleService(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      servicesApi.toggleActive(id, is_active).then(r => {
        if (r.error) throw new Error(r.error);
        return r.data!;
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICES_KEY(shopId) }),
  });
}
