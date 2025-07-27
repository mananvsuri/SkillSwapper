import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/lib/api';

export interface Skill {
  id: number;
  name: string;
  type: string;
  level: string;
  user_id: number;
}

export interface CreateSkillData {
  name: string;
  type: string;
  level: string;
}

export const useSkills = () => {
  const queryClient = useQueryClient();

  // Get user's skills
  const { data: skills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: () => apiClient.getMySkills(),
    enabled: !!localStorage.getItem('token'),
  });

  // Create skill mutation
  const createSkillMutation = useMutation({
    mutationFn: (skillData: CreateSkillData) => apiClient.createSkill(skillData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });

  return {
    skills: skills?.data || [],
    isLoadingSkills,
    createSkill: createSkillMutation.mutate,
    createSkillError: createSkillMutation.error,
    isCreatingSkill: createSkillMutation.isPending,
  };
}; 