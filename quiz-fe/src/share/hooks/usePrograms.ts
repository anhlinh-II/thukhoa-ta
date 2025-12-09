import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import messageService from '@/share/services/messageService';
import { programService } from '@/share/services/program/programService';
import { Program, ProgramRequest } from '@/share/services/program/models';

// Re-export Program type for convenience
export type { Program } from '@/share/services/program/models';

// Tree node type from API
export interface ProgramTreeNode {
  id: number;
  name: string;
  description?: string;
  level?: number;
  parentId?: number | null;
  children?: ProgramTreeNode[];
  quizGroupCount?: number;
  [key: string]: unknown;
}

// Query Keys
export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  list: (filters: string) => [...programKeys.lists(), { filters }] as const,
  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: number) => [...programKeys.details(), id] as const,
  byParent: (parentId: number) => [...programKeys.all, 'byParent', parentId] as const,
  roots: () => [...programKeys.all, 'roots'] as const,
  tree: () => [...programKeys.all, 'tree'] as const,
};

// Hook: Get all programs
export const usePrograms = () => {
  return useQuery({
    queryKey: programKeys.lists(),
    queryFn: () => programService.findAll(),
    staleTime: 30 * 1000, // 30 seconds - shorter for fresher data
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    meta: {
      errorMessage: 'Failed to fetch programs',
    },
  });
};

// Hook: Get program by ID
export const useProgram = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => programService.findById(id),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    meta: {
      errorMessage: `Failed to fetch program ${id}`,
    },
  });
};

// Hook: Get root programs (programs without parent)
export const useRootPrograms = () => {
  return useQuery({
    queryKey: programKeys.roots(),
    queryFn: async () => {
      const allPrograms = await programService.findAll();
      return allPrograms.filter(program => !program.parentId);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    meta: {
      errorMessage: 'Failed to fetch root programs',
    },
  });
};

// Hook: Get program tree from API
export const useProgramTree = () => {
  return useQuery({
    queryKey: programKeys.tree(),
    queryFn: () => programService.getTree() as Promise<ProgramTreeNode[]>,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    meta: {
      errorMessage: 'Failed to fetch program tree',
    },
  });
};

// Hook: Get child programs by parent ID
export const useChildPrograms = (parentId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: programKeys.byParent(parentId),
    queryFn: async () => {
      const allPrograms = await programService.findAll();
      return allPrograms.filter(program => program.parentId === parentId);
    },
    enabled: enabled && !!parentId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    meta: {
      errorMessage: `Failed to fetch child programs for parent ${parentId}`,
    },
  });
};

// Hook: Create program
export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProgramRequest) => programService.create(data),
    onSuccess: (newProgram) => {
      // Invalidate and refetch programs list
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      
      messageService.success('Tạo chương trình thành công!');
    },
    onError: (error: Error) => {
      messageService.error(`Tạo chương trình thất bại: ${error.message}`);
    },
  });
};

// Hook: Update program
export const useUpdateProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProgramRequest }) => 
      programService.update(id, data),
    onSuccess: (updatedProgram, { id }) => {
      // Invalidate all program queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      
      messageService.success('Cập nhật chương trình thành công!');
    },
    onError: (error: Error) => {
      messageService.error(`Cập nhật chương trình thất bại: ${error.message}`);
    },
  });
};

// Hook: Delete program
export const useDeleteProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => programService.delete(id),
    onSuccess: (_, id) => {
      // Invalidate all program queries
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      
      messageService.success('Xóa chương trình thành công!');
    },
    onError: (error: Error) => {
      messageService.error(`Xóa chương trình thất bại: ${error.message}`);
    },
  });
};

// Hook: Prefetch program
export const usePrefetchProgram = () => {
  const queryClient = useQueryClient();
  
  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: programKeys.detail(id),
      queryFn: () => programService.findById(id),
      staleTime: 30 * 1000,
    });
  };
};
