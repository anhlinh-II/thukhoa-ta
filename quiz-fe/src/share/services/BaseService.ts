import apiClient from './api';
import { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '@/share/utils/types';
import { handleProblems } from '../utils/functions';

export interface BaseEntity {
  id: number | string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface BaseRequest { }

export interface BaseResponse extends BaseEntity { }

export interface BaseView extends BaseEntity { }

export interface PagingViewRequest {
  skip?: number;
  take?: number;
  sort?: string;
  columns?: string;
  filter?: string;
  emptyFilter?: string;
  isGetTotal?: boolean;
  customParam?: Record<string, any>;
  aggs?: string;
}

export interface PagingViewResponse<T> {
  empty: boolean;
  data: T[];
  total: number;
  summary: Record<string, any>;
}

export interface PagingRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

export interface PagingResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export class BaseService<
  Entity extends BaseEntity = BaseEntity,
  Request extends BaseRequest = BaseRequest,
  Response extends BaseResponse = BaseResponse,
  View extends BaseView = BaseView
> {
  protected baseUrl: string;
  protected resourceName: string;

  constructor(baseUrl: string, resourceName: string) {
    this.baseUrl = baseUrl;
    this.resourceName = resourceName;
  }

  protected getEndpoint(): string {
    return `${this.resourceName}`;
  }

  protected async handleRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      let mergedHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (
        options.headers &&
        typeof options.headers === 'object' &&
        !Array.isArray(options.headers)
      ) {
        mergedHeaders = { ...mergedHeaders, ...options.headers as Record<string, string> };
      }

      const axiosConfig: AxiosRequestConfig = {
        url,
        method: options.method as any || 'GET',
        headers: mergedHeaders,
        data: options.body ? JSON.parse(options.body as string) : undefined,
      };

      const response = await apiClient.request<ApiResponse<T>>(axiosConfig);

      console.log('API Response:', response.data);

      const result = response.data;

      if (result.code !== 1000) {
        throw new Error(result.message || 'API request failed');
      }

      return result.result as T;
    } catch (error: any) {
      console.error('API Error:', error);
      handleProblems(error);
      throw error;
    }
  }

  // CRUD Operations
  async findAll(): Promise<Response[]> {
    return this.handleRequest<Response[]>(`${this.getEndpoint()}/all`);
  }

  async findAllPaged(pageable?: PagingRequest): Promise<PagingResponse<Response>> {
    const params = new URLSearchParams();
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString());
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString());
    if (pageable?.sort) params.append('sort', pageable.sort);
    if (pageable?.direction) params.append('direction', pageable.direction);

    const url = `${this.getEndpoint()}/paged${params.toString() ? `?${params.toString()}` : ''}`;
    return this.handleRequest<PagingResponse<Response>>(url);
  }

  async findById(id: string | number): Promise<Response> {
    return this.handleRequest<Response>(`${this.getEndpoint()}/${id}`);
  }

  async create(request: Request): Promise<Response> {
    return this.handleRequest<Response>(`${this.getEndpoint()}/create`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async update(id: string | number, request: Request): Promise<Response> {
    return this.handleRequest<Response>(`${this.getEndpoint()}/edit/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async delete(id: string | number): Promise<void> {
    return this.handleRequest<void>(`${this.getEndpoint()}/${id}`, {
      method: 'DELETE',
    });
  }

  // View Operations
  async getViewById(id: string | number): Promise<View> {
    return this.handleRequest<View>(`${this.getEndpoint()}/views/${id}`);
  }

  async getViewsPaged(pageable?: PagingRequest): Promise<PagingResponse<View>> {
    const params = new URLSearchParams();
    if (pageable?.page !== undefined) params.append('page', pageable.page.toString());
    if (pageable?.size !== undefined) params.append('size', pageable.size.toString());
    if (pageable?.sort) params.append('sort', pageable.sort);
    if (pageable?.direction) params.append('direction', pageable.direction);

    const url = `${this.getEndpoint()}/views${params.toString() ? `?${params.toString()}` : ''}`;
    return this.handleRequest<PagingResponse<View>>(url);
  }

  async getViewsPagedWithFilter(request: PagingViewRequest): Promise<PagingViewResponse<Record<string, any>>> {
    return this.handleRequest<PagingViewResponse<Record<string, any>>>(`${this.getEndpoint()}/views/list`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Tree APIs: fetch hierarchical data
  // Returns array of nodes (each node is a map/object with a 'children' array)
  // Now supports optional filter parameter for search
  async getTree(filter?: string): Promise<Record<string, any>[]> {
    const params = filter ? `?filter=${encodeURIComponent(filter)}` : '';
    return this.handleRequest<Record<string, any>[]>(`${this.getEndpoint()}/tree${params}`);
  }

  async getChildren(parentId: string | number | null): Promise<Record<string, any>[]> {
    const pid = parentId === null || parentId === undefined ? '' : `?parentId=${encodeURIComponent(String(parentId))}`;
    const url = `${this.getEndpoint()}/tree${pid}`;
    return this.handleRequest<Record<string, any>[]>(url);
  }
}
