import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryClient';
import type {
  Card,
  CreateCardData,
  UpdateCardData,
  ApiResponse,
} from '@/types';
import { useToast } from '@/hooks/use-toast';

// Fetch cards for a retro
export function useCards(retroId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.retros.cards(retroId!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Card[]>>(`/retros/${retroId}/cards`);
      return data.data.map(card => ({ ...card, id: card._id }));
    },
    enabled: !!retroId,
  });
}

// Create card
export function useCreateCard(retroId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCardData) => {
      const response = await api.post<ApiResponse<Card>>(
        `/retros/${retroId}/cards`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.retros.cards(retroId) });
      toast({
        title: 'Card added',
        description: 'Your card has been added to the board',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to add card',
        description: error.message,
      });
    },
  });
}

// Update card
export function useUpdateCard(retroId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ cardId, data }: { cardId: string; data: UpdateCardData }) => {
      const response = await api.put<ApiResponse<Card>>(
        `/cards/${cardId}`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.retros.cards(retroId) });
      toast({
        title: 'Card updated',
        description: 'Your changes have been saved',
      });
    },
  });
}

// Delete card (soft delete)
export function useDeleteCard(retroId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (cardId: string) => {
      await api.delete(`/cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.retros.cards(retroId) });
      toast({
        title: 'Card deleted',
        description: 'The card has been removed',
      });
    },
  });
}
