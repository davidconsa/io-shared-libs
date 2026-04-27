import type { HttpClientConfig, HttpRequest, HttpResponse, IHttpClient, } from './types/http-client.types.js';
import type { HttpInterceptor } from './types/interceptor.types.js';
import type { RetryConfig } from './types/retry.types.js';
import type { RequestMetadata } from './types/error.types.js';
import { buildInterceptorChain } from './interceptors/interceptor-pipeline.js';
import { CORRELATION_ID_HEADER, createCorrelationIdInterceptor, } from './interceptors/correlation-id.interceptor.js';
import { withRetry } from './retry/retry.strategy.js';
import { assertHttpsUrl } from './validation/url.validator.js';
import { HttpError } from './errors/index.js';
import { NetworkError } from './errors/index.js';
import { TimeoutError } from './errors/index.js';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BASE_DELAY_MS = 100;
const DEFAULT_MAX_DELAY_MS = 5_000;

function defaultShouldRetry(error: unknown): boolean {
  if (error instanceof HttpError) return error.isServerError;
  if (error instanceof NetworkError || error instanceof TimeoutError) return true;
  return false;
}

function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

function serializeBody(body: unknown): BodyInit | null {
  if (body === undefined || body === null) return null;
  if (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams
  ) {
    return body as BodyInit;
  }
  return JSON.stringify(body);
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json') || contentType.includes('+json')) {
    const text = await response.text();
    return (text.trim() ? JSON.parse(text) : undefined) as T;
  }
  if (contentType.startsWith('text/')) {
    return response.text() as unknown as T;
  }
  return response.arrayBuffer() as unknown as T;
}

export class HttpClient implements IHttpClient {
  private readonly defaultTimeoutMs: number;
  private readonly defaultHeaders: Record<string, string>;
  private readonly retryConfig: RetryConfig;
  private readonly interceptors: readonly HttpInterceptor[];
  private readonly correlationIdGenerator: () => string;

  constructor(config: HttpClientConfig = {}) {
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.correlationIdGenerator =
      config.correlationIdGenerator ?? (() => crypto.randomUUID());
    this.retryConfig = {
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      baseDelayMs: config.baseDelayMs ?? DEFAULT_BASE_DELAY_MS,
      maxDelayMs: config.maxDelayMs ?? DEFAULT_MAX_DELAY_MS,
      shouldRetry: defaultShouldRetry,
    };
    // CorrelationId interceptor is always the first in the chain
    this.interceptors = [
      createCorrelationIdInterceptor(this.correlationIdGenerator),
      ...(config.interceptors ?? []),
    ];
  }

  withInterceptor(interceptor: HttpInterceptor): IHttpClient {
    // slice(1) drops the existing CorrelationId interceptor —
    // the new constructor will prepend a fresh one
    return new HttpClient({
      defaultTimeoutMs: this.defaultTimeoutMs,
      defaultHeaders: this.defaultHeaders,
      maxRetries: this.retryConfig.maxRetries,
      baseDelayMs: this.retryConfig.baseDelayMs,
      maxDelayMs: this.retryConfig.maxDelayMs,
      correlationIdGenerator: this.correlationIdGenerator,
      interceptors: [...this.interceptors.slice(1), interceptor],
    });
  }

  get<T>(
    url: string,
    config?: Partial<Omit<HttpRequest, 'method' | 'url'>>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET', headers: config?.headers ?? {} });
  }

  post<T>(
    url: string,
    body?: unknown,
    config?: Partial<Omit<HttpRequest, 'method' | 'url' | 'body'>>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', body, headers: config?.headers ?? {} });
  }

  put<T>(
    url: string,
    body?: unknown,
    config?: Partial<Omit<HttpRequest, 'method' | 'url' | 'body'>>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', body, headers: config?.headers ?? {} });
  }

  patch<T>(
    url: string,
    body?: unknown,
    config?: Partial<Omit<HttpRequest, 'method' | 'url' | 'body'>>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', body, headers: config?.headers ?? {} });
  }

  delete<T>(
    url: string,
    config?: Partial<Omit<HttpRequest, 'method' | 'url'>>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE', headers: config?.headers ?? {} });
  }

  async request<T>(config: HttpRequest): Promise<HttpResponse<T>> {
    assertHttpsUrl(config.url);

    const timeoutMs = config.timeoutMs ?? this.defaultTimeoutMs;
    const mergedRequest: HttpRequest = {
      ...config,
      headers: { ...this.defaultHeaders, ...config.headers },
    };

    return withRetry(
      () => this.executeOnce<T>(mergedRequest, timeoutMs),
      this.retryConfig,
    );
  }

  private async executeOnce<T>(
    request: HttpRequest,
    timeoutMs: number,
  ): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const signal =
      request.signal != null
        ? (AbortSignal as { any?: (signals: AbortSignal[]) => AbortSignal }).any?.([
            request.signal,
            controller.signal,
          ]) ?? controller.signal
        : controller.signal;

    const executeRequest = async (req: HttpRequest): Promise<HttpResponse<unknown>> => {
      const startMs = Date.now();
      let fetchResponse: Response;

      try {
        const body = serializeBody(req.body);
        const init: RequestInit = {
          method: req.method,
          headers: req.headers,
          signal,
        };
        if (body !== null) init.body = body;

        fetchResponse = await fetch(req.url, init);
      } catch (error) {
        clearTimeout(timeoutId);
        const durationMs = Date.now() - startMs;
        const meta = this.buildMeta(req, durationMs);

        if (controller.signal.aborted) {
          throw new TimeoutError(timeoutMs, meta);
        }
        throw new NetworkError(
          `Network request failed: ${String(error)}`,
          meta,
          error,
        );
      }

      clearTimeout(timeoutId);
      const durationMs = Date.now() - startMs;
      const responseHeaders = headersToRecord(fetchResponse.headers);
      const correlationId =
        responseHeaders[CORRELATION_ID_HEADER.toLowerCase()] ??
        req.headers[CORRELATION_ID_HEADER] ??
        '';

      const meta: RequestMetadata = {
        url: req.url,
        method: req.method,
        correlationId,
        durationMs,
        attempt: 1,
      };

      if (!fetchResponse.ok) {
        const responseBody = await parseResponseBody<unknown>(fetchResponse);
        throw new HttpError(
          `HTTP ${fetchResponse.status} ${fetchResponse.statusText}`,
          fetchResponse.status,
          meta,
          responseBody,
        );
      }

      const data = await parseResponseBody<unknown>(fetchResponse);
      return {
        data,
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: responseHeaders,
        correlationId,
        durationMs,
        url: fetchResponse.url,
      };
    };

    const chain = buildInterceptorChain(
      this.interceptors as HttpInterceptor[],
      executeRequest,
    );

    return chain(request) as Promise<HttpResponse<T>>;
  }

  private buildMeta(request: HttpRequest, durationMs: number): RequestMetadata {
    return {
      url: request.url,
      method: request.method,
      correlationId: request.headers[CORRELATION_ID_HEADER] ?? '',
      durationMs,
      attempt: 1,
    };
  }
}
