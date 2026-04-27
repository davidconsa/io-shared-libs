import { mock } from 'jest-mock-extended';
import { HttpClient } from '../../src/http-client';
import type { HttpInterceptor, NextInterceptor } from '../../src/types/interceptor.types';
import { HttpError } from '../../src/errors/http.error';
import { TimeoutError } from '../../src/errors/timeout.error';
import { NetworkError } from '../../src/errors/network.error';
import { buildJsonResponse } from '../fixtures/mock-data';

describe('HttpClient', () => {
  let client: HttpClient;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch');
    client = new HttpClient({ defaultTimeoutMs: 5_000, maxRetries: 0 });
  });

  afterEach(() => {
    fetchSpy.mockReset();
  });

  describe('get', () => {
    it('should return typed JSON response', async () => {
      fetchSpy.mockResolvedValueOnce(
        buildJsonResponse({ id: '1', name: 'Ada' }),
      );

      const result = await client.get<{ id: string; name: string }>(
        'https://api.example.com/users/1',
      );

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ id: '1', name: 'Ada' });
    });

    it('should throw HttpError for 404 response', async () => {
      fetchSpy.mockResolvedValueOnce(
        buildJsonResponse({ error: 'NOT_FOUND' }, 404),
      );

      await expect(
        client.get('https://api.example.com/users/999'),
      ).rejects.toBeInstanceOf(HttpError);
    });

    it('should throw HttpError for 500 response', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({ error: 'OOPS' }, 500));

      await expect(
        client.get('https://api.example.com/users'),
      ).rejects.toBeInstanceOf(HttpError);
    });

    it('should return text response for text/plain content-type', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('hello world', {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        }),
      );

      const result = await client.get<string>('https://api.example.com/text');
      await expect(Promise.resolve(result.data)).resolves.toBe('hello world');
    });

    it('should return arrayBuffer for binary content-type', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(new Uint8Array([1, 2, 3]).buffer, {
          status: 200,
          headers: { 'content-type': 'application/octet-stream' },
        }),
      );

      const result = await client.get<ArrayBuffer>(
        'https://api.example.com/binary',
      );
      await expect(Promise.resolve(result.data)).resolves.toBeInstanceOf(ArrayBuffer);
    });

    it('should return arrayBuffer when response has no content-type', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(new Uint8Array([0]).buffer, { status: 200 }),
      );

      const result = await client.get<ArrayBuffer>('https://api.example.com/raw');
      await expect(Promise.resolve(result.data)).resolves.toBeInstanceOf(ArrayBuffer);
    });

    it('should return undefined for empty JSON body', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

      const result = await client.get<undefined>('https://api.example.com/empty');
      expect(result.data).toBeUndefined();
    });

    it('should use correlation ID from response headers when present', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'x-correlation-id': 'server-correlation-id',
          },
        }),
      );

      const result = await client.get<{ ok: boolean }>('https://api.example.com/echo');
      expect(result.correlationId).toBe('server-correlation-id');
    });

    it('should accept a custom AbortSignal via request config', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({ ok: true }));
      const controller = new AbortController();

      const result = await client.get<{ ok: boolean }>('https://api.example.com/health', {
        signal: controller.signal,
      });

      expect(result.status).toBe(200);
    });

    it('should fall back to controller signal when AbortSignal.any is unavailable', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({ ok: true }));
      const controller = new AbortController();

      const originalAny = (AbortSignal as { any?: unknown }).any;
      (AbortSignal as { any?: unknown }).any = undefined;

      try {
        const result = await client.get<{ ok: boolean }>('https://api.example.com/health', {
          signal: controller.signal,
        });
        expect(result.status).toBe(200);
      } finally {
        (AbortSignal as { any?: unknown }).any = originalAny;
      }
    });
  });

  describe('post', () => {
    it('should send JSON body', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({ id: '2' }, 201));

      await client.post('https://api.example.com/users', { name: 'Bob' });

      const [, init] = fetchSpy.mock.calls[0]!;
      expect(init?.body).toBe(JSON.stringify({ name: 'Bob' }));
    });

    it('should send string body as-is', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({}));

      await client.post('https://api.example.com/raw', 'plain text body');

      const [, init] = fetchSpy.mock.calls[0]!;
      expect(init?.body).toBe('plain text body');
    });
  });

  describe('put', () => {
    it('should send PUT request with body', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({ updated: true }));

      await client.put('https://api.example.com/users/1', { name: 'Eve' });

      const [, init] = fetchSpy.mock.calls[0]!;
      expect(init?.method).toBe('PUT');
      expect(init?.body).toBe(JSON.stringify({ name: 'Eve' }));
    });
  });

  describe('patch', () => {
    it('should send PATCH request with body', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({ patched: true }));

      await client.patch('https://api.example.com/users/1', { active: false });

      const [, init] = fetchSpy.mock.calls[0]!;
      expect(init?.method).toBe('PATCH');
    });
  });

  describe('delete', () => {
    it('should send DELETE request', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse(null));

      await client.delete('https://api.example.com/users/1');

      const [, init] = fetchSpy.mock.calls[0]!;
      expect(init?.method).toBe('DELETE');
    });
  });

  describe('error handling', () => {
    it('should throw TimeoutError when fetch is aborted by timeout', async () => {
      fetchSpy.mockImplementationOnce((_url, init) => {
        const signal = (init as RequestInit | undefined)?.signal;
        return new Promise((_resolve, reject) => {
          if (signal) {
            signal.addEventListener('abort', () => {
              reject(
                Object.assign(new DOMException('Aborted', 'AbortError')),
              );
            });
          }
        });
      });

      const shortTimeoutClient = new HttpClient({
        defaultTimeoutMs: 1,
        maxRetries: 0,
      });

      await expect(
        shortTimeoutClient.get('https://api.example.com/slow'),
      ).rejects.toBeInstanceOf(TimeoutError);
    });

    it('should throw NetworkError for TypeError from fetch', async () => {
      fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        client.get('https://api.example.com/users'),
      ).rejects.toBeInstanceOf(NetworkError);
    });

    it('should block non-HTTPS URLs', async () => {
      await expect(
        client.get('http://insecure.example.com/data'),
      ).rejects.toThrow(/Blocked non-HTTPS protocol/);
    });
  });

  describe('withInterceptor', () => {
    it('should return a new HttpClient instance', () => {
      const mockInterceptor = mock<HttpInterceptor>();
      const newClient = client.withInterceptor(mockInterceptor);
      expect(newClient).not.toBe(client);
    });

    it('should call the added interceptor on requests', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({ ok: true }));

      const mockInterceptor = mock<HttpInterceptor>();
      mockInterceptor.intercept.mockImplementation(
        (req, next: NextInterceptor) => next(req),
      );

      const clientWithInterceptor = client.withInterceptor(mockInterceptor);
      await clientWithInterceptor.get('https://api.example.com/health');

      expect(mockInterceptor.intercept).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry', () => {
    it('should retry on 5xx and exhaust attempts', async () => {
      const retryClient = new HttpClient({
        defaultTimeoutMs: 5_000,
        maxRetries: 2,
        baseDelayMs: 0,
        maxDelayMs: 0,
      });

      fetchSpy.mockImplementation(() =>
        Promise.resolve(buildJsonResponse({ error: 'unavailable' }, 503)),
      );

      await expect(
        retryClient.get('https://api.example.com/data'),
      ).rejects.toBeInstanceOf(HttpError);
      // 1 initial + 2 retries = 3 total
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('should retry on NetworkError', async () => {
      const retryClient = new HttpClient({
        maxRetries: 1,
        baseDelayMs: 0,
        maxDelayMs: 0,
      });

      fetchSpy.mockRejectedValue(new TypeError('connection reset'));

      await expect(
        retryClient.get('https://api.example.com/data'),
      ).rejects.toBeInstanceOf(NetworkError);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx errors', async () => {
      fetchSpy.mockImplementation(() =>
        Promise.resolve(buildJsonResponse({ error: 'not found' }, 404)),
      );

      const retryClient = new HttpClient({ maxRetries: 3 });
      await expect(
        retryClient.get('https://api.example.com/missing'),
      ).rejects.toBeInstanceOf(HttpError);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should not retry on unknown error types', async () => {
      const retryClient = new HttpClient({
        maxRetries: 2,
        baseDelayMs: 0,
        maxDelayMs: 0,
      });

      const throwingInterceptor = mock<HttpInterceptor>();
      throwingInterceptor.intercept.mockRejectedValue(new Error('unexpected'));

      const clientWithInterceptor = retryClient.withInterceptor(throwingInterceptor);

      await expect(
        clientWithInterceptor.get('https://api.example.com/data'),
      ).rejects.toThrow('unexpected');
      // should NOT retry: only 1 call to intercept
      expect(throwingInterceptor.intercept).toHaveBeenCalledTimes(1);
    });
  });
});
