import type { HttpInterceptor } from './interceptor.types.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface HttpRequest {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  correlationId: string;
  durationMs: number;
  url: string;
}

export interface HttpClientConfig {
  baseUrl?: string;
  defaultTimeoutMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  defaultHeaders?: Record<string, string>;
  interceptors?: HttpInterceptor[];
  correlationIdGenerator?: () => string;
}

export interface IHttpClient {
  request<T>(config: HttpRequest): Promise<HttpResponse<T>>;
  get<T>(url: string, config?: Partial<Omit<HttpRequest, 'method' | 'url'>>): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown, config?: Partial<Omit<HttpRequest, 'method' | 'url' | 'body'>>): Promise<HttpResponse<T>>;
  put<T>(url: string, body?: unknown, config?: Partial<Omit<HttpRequest, 'method' | 'url' | 'body'>>): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown, config?: Partial<Omit<HttpRequest, 'method' | 'url' | 'body'>>): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: Partial<Omit<HttpRequest, 'method' | 'url'>>): Promise<HttpResponse<T>>;
  withInterceptor(interceptor: HttpInterceptor): IHttpClient;
}
