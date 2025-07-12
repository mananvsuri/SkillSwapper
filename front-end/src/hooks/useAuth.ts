import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: number;
  name: string;
  email: string;
  location?: string;
  photo_path?: string;
  availability?: string;
  is_public: boolean;
  is_admin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  location?: string;
  photo_path?: string;
  availability?: string;
  is_public?: boolean;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => apiClient.login(credentials),
    onSuccess: (response: ApiResponse<{ access_token: string; token_type: string }>) => {
      if (response.data) {
        localStorage.setItem('token', response.data.access_token);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        navigate('/dashboard');
      }
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) => apiClient.register(userData),
    onSuccess: (response: ApiResponse<User>) => {
      if (response.data) {
        navigate('/login');
      }
    },
  });

  // Get current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: !!localStorage.getItem('token'),
    retry: false,
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    navigate('/');
  };

  return {
    user: user?.data,
    isLoadingUser,
    login: loginMutation.mutate,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout,
  };
}; 