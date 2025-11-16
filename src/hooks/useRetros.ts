import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryClient';
import type {
  Retro,
  CreateRetroData,
  RetroFilters,
  ApiResponse,
  PaginatedResponse,
} from '@/types';
import { useToast } from '@/hooks/use-toast';

// Fetch retros for a team
export function useRetros(teamId: string | undefined, filters?: RetroFilters) {
  return useQuery({
    queryKey: queryKeys.retros.filtered(teamId!, filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const { data } = await api.get<PaginatedResponse<Retro>>(
        `/teams/${teamId}/retros?${params.toString()}`
      );
      return data.data.items.map(retro => ({ ...retro, id: retro._id }));
    },
    enabled: !!teamId,
  });
}

// Fetch single retro
export function useRetro(retroId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.retros.detail(retroId!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Retro>>(`/retros/${retroId}`);
      return { ...data.data, id: data.data._id };
    },
    enabled: !!retroId,
  });
}

// Create retro
export function useCreateRetro(teamId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateRetroData) => {
      const response = await api.post<ApiResponse<Retro>>(
        `/teams/${teamId}/retros`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.retros.all(teamId) });
      toast({
        title: 'Retrospective created',
        description: 'Your retro is ready for the team',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create retrospective',
        description: error.message,
      });
    },
  });
}

// Delete retro
export function useDeleteRetro(teamId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (retroId: string) => {
      await api.delete(`/retros/${retroId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.retros.all(teamId) });
      toast({
        title: 'Retrospective deleted',
        description: 'The retrospective has been removed',
      });
    },
  });
}
