import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

// Tạm thời interface cho Program (sau này sẽ có API service thật)
export interface Program {
  id: number;
  name: string;
  description: string;
  slug: string;
  level: number;
  isActive: boolean;
  displayOrder: number;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
}

// Mock API service cho Programs (thay thế sau khi có backend API)
const mockProgramsApi = {
  getAll: async (): Promise<Program[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 1,
        name: 'English Learning Program',
        description: 'Comprehensive English learning curriculum',
        slug: 'english-learning-program',
        level: 1,
        isActive: true,
        displayOrder: 1,
        createdAt: '2025-09-10T00:00:00Z',
        updatedAt: '2025-09-10T00:00:00Z',
      },
      {
        id: 2,
        name: 'Java Programming',
        description: 'Complete Java programming course',
        slug: 'java-programming',
        level: 2,
        isActive: true,
        displayOrder: 2,
        createdAt: '2025-09-10T00:00:00Z',
        updatedAt: '2025-09-10T00:00:00Z',
      },
      {
        id: 3,
        name: 'Spring Framework',
        description: 'Advanced Spring framework training',
        slug: 'spring-framework',
        level: 3,
        isActive: true,
        displayOrder: 3,
        createdAt: '2025-09-10T00:00:00Z',
        updatedAt: '2025-09-10T00:00:00Z',
      },
      {
        id: 4,
        name: 'Grammar Basics',
        description: 'Basic English grammar rules',
        slug: 'grammar-basics',
        level: 1,
        isActive: true,
        displayOrder: 1,
        parentId: 1,
        createdAt: '2025-09-10T00:00:00Z',
        updatedAt: '2025-09-10T00:00:00Z',
      },
      {
        id: 5,
        name: 'Vocabulary Building',
        description: 'Essential vocabulary development',
        slug: 'vocabulary-building',
        level: 1,
        isActive: true,
        displayOrder: 2,
        parentId: 1,
        createdAt: '2025-09-10T00:00:00Z',
        updatedAt: '2025-09-10T00:00:00Z',
      },
    ];
  },

  getById: async (id: number): Promise<Program> => {
    const programs = await mockProgramsApi.getAll();
    const program = programs.find(p => p.id === id);
    if (!program) {
      throw new Error(`Program with id ${id} not found`);
    }
    return program;
  },

  create: async (data: Partial<Program>): Promise<Program> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: Date.now(), // Mock ID
      name: data.name || '',
      description: data.description || '',
      slug: data.slug || '',
      level: data.level || 1,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder || 0,
      parentId: data.parentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  update: async (id: number, data: Partial<Program>): Promise<Program> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingProgram = await mockProgramsApi.getById(id);
    return {
      ...existingProgram,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },

  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock deletion
  },
};

// Query Keys
export const programKeys = {
  all: ['programs'] as const,
  lists: () => [...programKeys.all, 'list'] as const,
  list: (filters: string) => [...programKeys.lists(), { filters }] as const,
  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: number) => [...programKeys.details(), id] as const,
  byParent: (parentId: number) => [...programKeys.all, 'byParent', parentId] as const,
  roots: () => [...programKeys.all, 'roots'] as const,
};

// Hook: Get all programs
export const usePrograms = () => {
  return useQuery({
    queryKey: programKeys.lists(),
    queryFn: () => mockProgramsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: 'Failed to fetch programs',
    },
  });
};

// Hook: Get program by ID
export const useProgram = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => mockProgramsApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
      const allPrograms = await mockProgramsApi.getAll();
      return allPrograms.filter(program => !program.parentId);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    meta: {
      errorMessage: 'Failed to fetch root programs',
    },
  });
};

// Hook: Get child programs by parent ID
export const useChildPrograms = (parentId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: programKeys.byParent(parentId),
    queryFn: async () => {
      const allPrograms = await mockProgramsApi.getAll();
      return allPrograms.filter(program => program.parentId === parentId);
    },
    enabled: enabled && !!parentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    meta: {
      errorMessage: `Failed to fetch child programs for parent ${parentId}`,
    },
  });
};

// Hook: Create program
export const useCreateProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Program>) => mockProgramsApi.create(data),
    onSuccess: (newProgram) => {
      // Invalidate and refetch programs list
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      queryClient.invalidateQueries({ queryKey: programKeys.roots() });
      
      // Update cache with new item
      queryClient.setQueryData(programKeys.detail(newProgram.id), newProgram);
      
      message.success('Program created successfully!');
    },
    onError: (error: Error) => {
      message.error(`Failed to create program: ${error.message}`);
    },
  });
};

// Hook: Update program
export const useUpdateProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Program> }) => 
      mockProgramsApi.update(id, data),
    onSuccess: (updatedProgram, { id }) => {
      // Update the specific item in cache
      queryClient.setQueryData(programKeys.detail(id), updatedProgram);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      queryClient.invalidateQueries({ queryKey: programKeys.roots() });
      
      message.success('Program updated successfully!');
    },
    onError: (error: Error) => {
      message.error(`Failed to update program: ${error.message}`);
    },
  });
};

// Hook: Delete program
export const useDeleteProgram = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => mockProgramsApi.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: programKeys.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
      queryClient.invalidateQueries({ queryKey: programKeys.roots() });
      
      message.success('Program deleted successfully!');
    },
    onError: (error: Error) => {
      message.error(`Failed to delete program: ${error.message}`);
    },
  });
};

// Hook: Prefetch program
export const usePrefetchProgram = () => {
  const queryClient = useQueryClient();
  
  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: programKeys.detail(id),
      queryFn: () => mockProgramsApi.getById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};
