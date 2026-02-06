/**
 * Base Service Class
 * DRY principle - common HTTP functionality for all services
 */

import { apiClient } from '../client';
import type { ApiResponse } from '@/types';

export abstract class BaseService {
  protected abstract readonly basePath: string;

  protected get<T>(path: string, params?: Record<string, unknown> | Record<string, string | undefined>): Promise<ApiResponse<T>> {
    return apiClient.get<T>(`${this.basePath}${path}`, params as Record<string, string | undefined>);
  }

  protected post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return apiClient.post<T>(`${this.basePath}${path}`, body);
  }

  protected put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return apiClient.put<T>(`${this.basePath}${path}`, body);
  }

  protected patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return apiClient.patch<T>(`${this.basePath}${path}`, body);
  }

  protected del<T>(path: string): Promise<ApiResponse<T>> {
    return apiClient.delete<T>(`${this.basePath}${path}`);
  }
}
