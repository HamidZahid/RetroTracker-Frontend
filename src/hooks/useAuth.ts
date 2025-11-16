import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import type { LoginCredentials, RegisterData, AuthResponse, ApiResponse, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      return data.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${data.user.name}`,
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
      });
    },
  });
}

export function useRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      toast({
        title: 'Account created!',
        description: 'Welcome to Retro Tracker',
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || 'Unable to create account',
      });
    },
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  return () => {
    logout();
    navigate('/login');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };
}

export interface UpdateProfileData {
  name: string;
  email: string;
  password?: string;
}

export function useUpdateProfile() {
  const { updateUser } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const { data: response } = await api.put<ApiResponse<User>>('/auth/profile', data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update profile',
        description: error.message || 'Unable to update your profile',
      });
    },
  });
}
