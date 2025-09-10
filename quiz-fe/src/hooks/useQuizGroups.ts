import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizGroupApi, type QuizGroup, type PageResponse } from '../services/quizGroupApi';
import { message } from 'antd';

// Query Keys - centralized key management
export const quizGroupKeys = {
  all: ['quizGroups'] as const,
  lists: () => [...quizGroupKeys.all, 'list'] as const,
  list: (filters: string) => [...quizGroupKeys.lists(), { filters }] as const,
  details: () => [...quizGroupKeys.all, 'detail'] as const,
  detail: (id: number) => [...quizGroupKeys.details(), id] as const,
  paged: (page: number, size: number) => [...quizGroupKeys.all, 'paged', { page, size }] as const,
  byProgram: (programId: number) => [...quizGroupKeys.all, 'byProgram', programId] as const,
  slugExists: (slug: string) => [...quizGroupKeys.all, 'slugExists', slug] as const,
};

// Hook: Get all quiz groups
export const useQuizGroups = () => {
  return useQuery({
    queryKey: quizGroupKeys.lists(),
    queryFn: () => quizGroupApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: 'Failed to fetch quiz groups',
    },
  });
};

// Hook: Get quiz groups with pagination
export const useQuizGroupsPaged = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: quizGroupKeys.paged(page, size),
    queryFn: () => quizGroupApi.getAllPaged(page, size),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to fetch paged quiz groups',
    },
  });
};

// Hook: Get quiz group by ID
export const useQuizGroup = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: quizGroupKeys.detail(id),
    queryFn: () => quizGroupApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    meta: {
      errorMessage: `Failed to fetch quiz group ${id}`,
    },
  });
};

// Hook: Get quiz groups by program ID
export const useQuizGroupsByProgram = (programId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: quizGroupKeys.byProgram(programId),
    queryFn: () => quizGroupApi.getByProgramId(programId),
    enabled: enabled && !!programId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    meta: {
      errorMessage: `Failed to fetch quiz groups for program ${programId}`,
    },
  });
};

// Hook: Check if slug exists
export const useSlugExists = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: quizGroupKeys.slugExists(slug),
    queryFn: () => quizGroupApi.checkSlugExists(slug),
    enabled: enabled && !!slug && slug.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for slug checking
    gcTime: 5 * 60 * 1000,
    meta: {
      errorMessage: `Failed to check slug availability: ${slug}`,
    },
  });
};

// Hook: Create quiz group
export const useCreateQuizGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<QuizGroup>) => quizGroupApi.create(data),
    onSuccess: (newQuizGroup) => {
      // Invalidate and refetch quiz groups list
      queryClient.invalidateQueries({ queryKey: quizGroupKeys.lists() });
      
      // Optionally update the cache with the new item
      queryClient.setQueryData(quizGroupKeys.detail(newQuizGroup.id), newQuizGroup);
      
      message.success('Quiz group created successfully!');
    },
    onError: (error: Error) => {
      message.error(`Failed to create quiz group: ${error.message}`);
    },
  });
};

// Hook: Update quiz group
export const useUpdateQuizGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<QuizGroup> }) => 
      quizGroupApi.update(id, data),
    onSuccess: (updatedQuizGroup, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(quizGroupKeys.detail(id), updatedQuizGroup);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: quizGroupKeys.lists() });
      
      message.success('Quiz group updated successfully!');
    },
    onError: (error: Error) => {
      message.error(`Failed to update quiz group: ${error.message}`);
    },
  });
};

// Hook: Delete quiz group
export const useDeleteQuizGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => quizGroupApi.softDelete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: quizGroupKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: quizGroupKeys.lists() });
      
      message.success('Quiz group deleted successfully!');
    },
    onError: (error: Error) => {
      message.error(`Failed to delete quiz group: ${error.message}`);
    },
  });
};

// Hook: Prefetch quiz group (for hover effects, navigation, etc.)
export const usePrefetchQuizGroup = () => {
  const queryClient = useQueryClient();
  
  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: quizGroupKeys.detail(id),
      queryFn: () => quizGroupApi.getById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Hook: Optimistic updates utility
export const useOptimisticQuizGroup = () => {
  const queryClient = useQueryClient();
  
  const optimisticUpdate = (id: number, updates: Partial<QuizGroup>) => {
    queryClient.setQueryData(
      quizGroupKeys.detail(id),
      (oldData: QuizGroup | undefined) => 
        oldData ? { ...oldData, ...updates } : undefined
    );
  };
  
  const rollbackUpdate = (id: number) => {
    queryClient.invalidateQueries({ queryKey: quizGroupKeys.detail(id) });
  };
  
  return { optimisticUpdate, rollbackUpdate };
};
