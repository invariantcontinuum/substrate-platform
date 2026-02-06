/**
 * API Client with Fallback
 * API-first approach: tries real API, falls back to mock data
 * Following SOLID principles - Single Responsibility for HTTP handling
 */

import { apiConfig } from '@/config/env';
import { ApiError, ApiResponse } from '@/types';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  retries?: number;
}

interface FallbackConfig {
  enabled: boolean;
  delay: number;
  onFallback?: (endpoint: string, error: Error) => void;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private fallbackConfig: FallbackConfig;
  private mockImporter: (endpoint: string, method: string, body?: unknown) => Promise<unknown>;

  constructor(fallbackConfig?: Partial<FallbackConfig>) {
    this.baseURL = apiConfig.baseURL;
    this.defaultTimeout = apiConfig.timeout;
    this.fallbackConfig = {
      enabled: apiConfig.enableMock,
      delay: apiConfig.mockDelay,
      ...fallbackConfig,
    };
    // Lazy-loaded mock importer
    this.mockImporter = async () => null;
  }

  /** Set the mock data provider (called during initialization) */
  setMockProvider(importer: (endpoint: string, method: string, body?: unknown) => Promise<unknown>): void {
    this.mockImporter = importer;
  }

  private buildURL(endpoint: string, params?: RequestConfig['params']): string {
    const url = new URL(
      endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`,
      window.location.origin
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return { data: undefined as T };
    }

    return response.json();
  }

  private async attemptRequest<T>(
    endpoint: string,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = this.defaultTimeout,
    } = config;

    const url = this.buildURL(endpoint, params);

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await this.fetchWithTimeout(url, options, timeout);
    return this.handleResponse<T>(response);
  }

  private async fallbackToMock<T>(endpoint: string, method: string, body?: unknown): Promise<ApiResponse<T>> {
    // Simulate network delay for realistic mock behavior
    await new Promise(resolve => setTimeout(resolve, this.fallbackConfig.delay));
    
    const data = await this.mockImporter(endpoint, method, body);
    
    if (data === null) {
      throw new Error(`No mock data available for ${method} ${endpoint}`);
    }

    return { data: data as T };
  }

  /**
   * Main request method - API first, fallback to mock
   * Following Dependency Inversion - depends on abstraction, not concrete implementation
   */
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { retries = 0, body } = config;

    // If mock-only mode, skip real API
    if (this.fallbackConfig.enabled && this.isMockOnly()) {
      return this.fallbackToMock<T>(endpoint, config.method || 'GET', body);
    }

    // Try real API with retries
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.attemptRequest<T>(endpoint, config);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < retries) {
          // Exponential backoff
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
        }
      }
    }

    // Fallback to mock if enabled and real API failed
    if (this.fallbackConfig.enabled && lastError) {
      this.fallbackConfig.onFallback?.(endpoint, lastError);
      return this.fallbackToMock<T>(endpoint, config.method || 'GET', body);
    }

    throw lastError;
  }

  private isMockOnly(): boolean {
    // Check if we should use mock exclusively
    return apiConfig.enableMock && (
      this.baseURL === '' || 
      this.baseURL === '/mock' ||
      typeof window !== 'undefined' && window.location.hostname === 'localhost' && 
      apiConfig.enableMock
    );
  }

  // Convenience methods
  get<T>(endpoint: string, params?: RequestConfig['params'], config?: Omit<RequestConfig, 'method' | 'params'>) {
    return this.request<T>(endpoint, { ...config, method: 'GET', params });
  }

  post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  patch<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
