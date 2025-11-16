import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryClient';
import type {
  Team,
  TeamMember,
  CreateTeamData,
  InviteMemberData,
  ApiResponse,
} from '@/types';
import { useToast } from '@/hooks/use-toast';

// Fetch all teams
export function useTeams() {
  return useQuery({
    queryKey: queryKeys.teams.all,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Team[]>>('/teams');
      // Add id alias for easier use
      return data.data.map(team => ({ ...team, id: team._id }));
    },
  });
}

// Fetch single team
export function useTeam(teamId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.detail(teamId!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Team>>(`/teams/${teamId}`);
      return { ...data.data, id: data.data._id };
    },
    enabled: !!teamId,
  });
}

// Fetch team members
export function useTeamMembers(teamId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TeamMember[]>>(`/teams/${teamId}/members`);
      return data.data;
    },
    enabled: !!teamId,
  });
}

// Create team
export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTeamData) => {
      const response = await api.post<ApiResponse<Team>>('/teams', data);
      return { ...response.data.data, id: response.data.data._id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast({
        title: 'Team created',
        description: 'Your team has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create team',
        description: error.message,
      });
    },
  });
}

// Invite member
export function useInviteMember(teamId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InviteMemberData) => {
      const response = await api.post<ApiResponse<TeamMember>>(
        `/teams/${teamId}/invite`,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
      toast({
        title: 'Member invited',
        description: 'Team member has been invited successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to invite member',
        description: error.message,
      });
    },
  });
}

// Remove member
export function useRemoveMember(teamId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (memberId: string) => {
      await api.delete(`/teams/${teamId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
      toast({
        title: 'Member removed',
        description: 'Team member has been removed',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to remove member',
        description: error.message,
      });
    },
  });
}
