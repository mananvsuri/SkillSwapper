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
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.login(credentials);
      
      // Handle different error scenarios
      if (response.error) {
        let errorMessage = response.error;
        
        // Provide more specific error messages
        if (response.error.includes('401') || response.error.includes('Unauthorized')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (response.error.includes('403') || response.error.includes('Forbidden')) {
          errorMessage = 'Your account has been banned. Please contact support for assistance.';
        } else if (response.error.includes('422') || response.error.includes('Validation')) {
          errorMessage = 'Please check your email and password format.';
        } else if (response.error.includes('500') || response.error.includes('Internal')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (response.error.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
        
        throw new Error(errorMessage);
      }
      
      return response;
    },
    onSuccess: (response: ApiResponse<{ access_token: string; token_type: string }>) => {
      if (response.data) {
        localStorage.setItem('token', response.data.access_token);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        navigate('/dashboard');
      }
    },
    onError: (error: Error) => {
      // Error is already handled in mutationFn, but we can add additional logging here
      console.error('Login error:', error.message);
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