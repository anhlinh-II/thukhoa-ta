import { useQuery } from '@tanstack/react-query';
import { quizMockTestService } from '../services/quiz_mock_test/quizMockTestService';

const QUIZ_MOCK_TEST_QUERY_KEYS = {
  all: ['quizMockTests'] as const,
  byGroup: (groupId: number | string) => [...QUIZ_MOCK_TEST_QUERY_KEYS.all, 'byGroup', groupId] as const,
};

/**
 * Hook to fetch mock tests for a specific quiz group
 * @param groupId - Quiz Group ID
 * @param enabled - Whether to enable the query
 */
export const useQuizMockTestsByGroup = (groupId?: number | string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUIZ_MOCK_TEST_QUERY_KEYS.byGroup(groupId || ''),
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID is required');

      const request = {
        skip: 0,
        take: 100,
        filter: JSON.stringify([
          {
            field: 'quizGroupId',
            operator: 'EQUALS',
            value: Number(groupId),
            dataType: 'NUMBER',
          },
        ]),
      };

      const response = await quizMockTestService.getViewsPagedWithFilter(request);
      
      if (!response || !response.data) {
        throw new Error('Failed to fetch mock tests');
      }

      return response.data;
    },
    enabled: !!groupId && enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch all quiz mock tests with optional filtering
 */
export const useQuizMockTests = (skip: number = 0, take: number = 10) => {
  return useQuery({
    queryKey: QUIZ_MOCK_TEST_QUERY_KEYS.all,
    queryFn: async () => {
      const request = {
        skip,
        take,
      };

      const response = await quizMockTestService.getViewsPagedWithFilter(request);
      
      if (!response || !response.data) {
        throw new Error('Failed to fetch mock tests');
      }

      return response.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};
