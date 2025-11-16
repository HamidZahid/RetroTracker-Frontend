import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryClient';
import type {
  ActionItem,
  ApiResponse,
} from '@/types';
import { useToast } from '@/hooks/use-toast';

export interface CreateActionItemData {
  title: string;
  description?: string;
  retroId: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateActionItemData {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface ActionItemFilters {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  retroId?: string;
  search?: string;
}

// Fetch action items for a team
export function useActionItems(teamId: string | undefined, filters?: ActionItemFilters) {
  return useQuery({
    queryKey: queryKeys.actionItems.all(teamId!),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.retroId) params.append('retroId', filters.retroId);
      if (filters?.search) params.append('search', filters.search);

      const { data } = await api.get<ApiResponse<ActionItem[]>>(
        `/teams/${teamId}/action-items?${params.toString()}`
      );
      return data.data;
    },
    enabled: !!teamId,
  });
}

// Fetch single action item
export function useActionItem(actionItemId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.actionItems.detail(actionItemId!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ActionItem>>(`/action-items/${actionItemId}`);
      return data.data;
    },
    enabled: !!actionItemId,
  });
}

// Create action item
export function useCreateActionItem(teamId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateActionItemData) => {
      const response = await api.post<ApiResponse<ActionItem>>(
        `/teams/${teamId}/action-items`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItems.all(teamId) });
      toast({
        title: 'Action item created',
        description: 'The action item has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create action item',
        description: error.message,
      });
    },
  });
}

// Update action item
export function useUpdateActionItem(teamId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ actionItemId, data }: { actionItemId: string; data: UpdateActionItemData }) => {
      const response = await api.put<ApiResponse<ActionItem>>(
        `/action-items/${actionItemId}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItems.all(teamId) });
      toast({
        title: 'Action item updated',
        description: 'Changes have been saved',
      });
    },
  });
}

// Delete action item
export function useDeleteActionItem(teamId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (actionItemId: string) => {
      await api.delete(`/action-items/${actionItemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.actionItems.all(teamId) });
      toast({
        title: 'Action item deleted',
        description: 'The action item has been removed',
      });
    },
  });
}

