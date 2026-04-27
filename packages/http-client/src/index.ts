// Core interface & class
export type {
  IHttpClient,
  HttpClientConfig,
  HttpRequest,
  HttpResponse,
  HttpMethod,
} from './types/http-client.types.js';
import type { HttpClientConfig } from './types/http-client.types.js';
import { HttpClient } from './http-client.js';

export { HttpClient };

// Interceptor contracts
export type { HttpInterceptor, NextInterceptor } from './types/interceptor.types.js';

// Retry config
export type { RetryConfig } from './types/retry.types.js';

// Error types
export type { RequestMetadata } from './types/error.types.js';
export { HttpClientError } from './errors/http-client.error.js';
export { HttpError } from './errors/http.error.js';
export { NetworkError } from './errors/network.error.js';
export { TimeoutError } from './errors/timeout.error.js';

// Built-in interceptors
export {
  createCorrelationIdInterceptor,
  CORRELATION_ID_HEADER,
} from './interceptors/correlation-id.interceptor.js';

// Retry utility (useful for consumers wrapping HttpClient)
export { withRetry } from './retry/retry.strategy.js';

// Factory
export function createHttpClient(config?: HttpClientConfig): HttpClient {
  return new HttpClient(config);
}
