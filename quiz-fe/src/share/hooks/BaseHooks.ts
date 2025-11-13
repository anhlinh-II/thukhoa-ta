import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { message } from 'antd';
import { BaseService, BaseEntity, BaseRequest, BaseResponse, BaseView, PagingRequest, PagingResponse } from '../services/BaseService';

export interface BaseHooksConfig {
  queryKeyPrefix: string;
  resourceName: string;
  enabledByDefault?: boolean;
}

export class BaseHooks<
  Entity extends BaseEntity = BaseEntity,
  Request extends BaseRequest = BaseRequest,
  Response extends BaseResponse = BaseResponse,
  View extends BaseView = BaseView
> {
  protected service: BaseService<Entity, Request, Response, View>;
  protected config: BaseHooksConfig;
  protected queryClient: ReturnType<typeof useQueryClient>;

  constructor(
    service: BaseService<Entity, Request, Response, View>,
    config: BaseHooksConfig
  ) {
    this.service = service;
    this.config = config;
    this.queryClient = useQueryClient();
  }

  // Query Keys
  getQueryKeys() {
    return {
      all: [this.config.queryKeyPrefix] as const,
      lists: () => [this.config.queryKeyPrefix, 'list'] as const,
      list: (filters?: any) => [this.config.queryKeyPrefix, 'list', { filters }] as const,
      details: () => [this.config.queryKeyPrefix, 'detail'] as const,
      detail: (id: string | number) => [this.config.queryKeyPrefix, 'detail', id] as const,
      views: () => [this.config.queryKeyPrefix, 'views'] as const,
      view: (id: string | number) => [this.config.queryKeyPrefix, 'views', id] as const,
      viewsPaged: (filters?: any) => [this.config.queryKeyPrefix, 'views', 'paged', { filters }] as const,
    };
  }

  // Queries
  useFindAll(options?: Omit<UseQueryOptions<Response[], Error>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: this.getQueryKeys().lists(),
      queryFn: () => this.service.findAll(),
      enabled: this.config.enabledByDefault ?? true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      ...options,
    });
  }

  useFindAllPaged(
    pageable?: PagingRequest,
    options?: Omit<UseQueryOptions<PagingResponse<Response>, Error>, 'queryKey' | 'queryFn'>
  ) {
    return useQuery({
      queryKey: this.getQueryKeys().list(pageable),
      queryFn: () => this.service.findAllPaged(pageable),
      enabled: this.config.enabledByDefault ?? true,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      ...options,
    });
  }

  useFindById(
    id: string | number,
    options?: Omit<UseQueryOptions<Response, Error>, 'queryKey' | 'queryFn'>
  ) {
    return useQuery({
      queryKey: this.getQueryKeys().detail(id),
      queryFn: () => this.service.findById(id),
      enabled: !!id && (this.config.enabledByDefault ?? true),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      ...options,
    });
  }

  useGetViewsPaged(
    pageable?: PagingRequest,
    options?: Omit<UseQueryOptions<PagingResponse<View>, Error>, 'queryKey' | 'queryFn'>
  ) {
    return useQuery({
      queryKey: this.getQueryKeys().viewsPaged(pageable),
      queryFn: () => this.service.getViewsPaged(pageable),
      enabled: this.config.enabledByDefault ?? true,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      ...options,
    });
  }

  // Mutations
  useCreate(options?: UseMutationOptions<Response, Error, Request>) {
    return useMutation({
      mutationFn: (request: Request) => this.service.create(request),
      onSuccess: (data, variables) => {
        // Invalidate and refetch queries
        this.queryClient.invalidateQueries({ queryKey: this.getQueryKeys().all });
        message.success(`${this.config.resourceName} created successfully!`);
        options?.onSuccess?.(data, variables, undefined);
      },
      onError: (error, variables, context) => {
        message.error(`Failed to create ${this.config.resourceName}: ${error.message}`);
        options?.onError?.(error, variables, context);
      },
      ...options,
    });
  }

  useUpdate(options?: UseMutationOptions<Response, Error, { id: string | number; request: Request }>) {
    return useMutation({
      mutationFn: ({ id, request }: { id: string | number; request: Request }) =>
        this.service.update(id, request),
      onSuccess: (data, variables) => {
        // Invalidate specific item and lists
        this.queryClient.invalidateQueries({ queryKey: this.getQueryKeys().detail(variables.id) });
        this.queryClient.invalidateQueries({ queryKey: this.getQueryKeys().all });
        message.success(`${this.config.resourceName} updated successfully!`);
        options?.onSuccess?.(data, variables, undefined);
      },
      onError: (error, variables, context) => {
        message.error(`Failed to update ${this.config.resourceName}: ${error.message}`);
        options?.onError?.(error, variables, context);
      },
      ...options,
    });
  }

  useDelete(options?: UseMutationOptions<void, Error, string | number, { previousData: [readonly unknown[], unknown][] }>) {
    return useMutation({
      mutationFn: (id: string | number) => this.service.delete(id),
      onMutate: async (id) => {
        // Cancel outgoing refetches
        await this.queryClient.cancelQueries({ queryKey: this.getQueryKeys().all });

        // Snapshot previous value
        const previousData = this.queryClient.getQueriesData({ queryKey: this.getQueryKeys().all });

        // Optimistically update
        this.queryClient.setQueriesData(
          { queryKey: this.getQueryKeys().lists() },
          (old: Response[] | undefined) => old?.filter((item) => item.id !== id)
        );

        // Return context with snapshot
        return { previousData };
      },
      onSuccess: (data, variables, context) => {
        message.success(`${this.config.resourceName} deleted successfully!`);
        options?.onSuccess?.(data, variables, context);
      },
      onError: (error, variables, context) => {
        // Rollback optimistic update
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]) => {
            this.queryClient.setQueryData(queryKey, data);
          });
        }
        message.error(`Failed to delete ${this.config.resourceName}: ${error.message}`);
        options?.onError?.(error, variables, context);
      },
      onSettled: (data, error, variables, context) => {
        // Always refetch after error or success
        this.queryClient.invalidateQueries({ queryKey: this.getQueryKeys().all });
        options?.onSettled?.(data, error, variables, context);
      },
      ...options,
    });
  }

  // Utility methods
  prefetchById(id: string | number) {
    return this.queryClient.prefetchQuery({
      queryKey: this.getQueryKeys().detail(id),
      queryFn: () => this.service.findById(id),
      staleTime: 5 * 60 * 1000,
    });
  }

  prefetchAll() {
    return this.queryClient.prefetchQuery({
      queryKey: this.getQueryKeys().lists(),
      queryFn: () => this.service.findAll(),
      staleTime: 5 * 60 * 1000,
    });
  }

  invalidateAll() {
    return this.queryClient.invalidateQueries({ queryKey: this.getQueryKeys().all });
  }

  removeFromCache(id: string | number) {
    this.queryClient.removeQueries({ queryKey: this.getQueryKeys().detail(id) });
  }
}
