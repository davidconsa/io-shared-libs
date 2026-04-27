import { mock } from 'jest-mock-extended';
import { HttpClient } from '../../src/http-client';
import type { HttpInterceptor, NextInterceptor } from '../../src/types/interceptor.types';
import { HttpError } from '../../src/errors/http.error';
import { TimeoutError } from '../../src/errors/timeout.error';
import { NetworkError } from '../../src/errors/network.error';
import { buildJsonResponse } from '../fixtures/mock-data';

const fetchSpy = jest.spyOn(globalThis, 'fetch');

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
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
  });

  describe('post', () => {
    it('should send JSON body', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({ id: '2' }, 201));

      await client.post('https://api.example.com/users', { name: 'Bob' });

      const [, init] = fetchSpy.mock.calls[0]!;
      expect(init?.body).toBe(JSON.stringify({ name: 'Bob' }));
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
      jest.useFakeTimers();
      const retryClient = new HttpClient({
        defaultTimeoutMs: 5_000,
        maxRetries: 2,
        baseDelayMs: 10,
      });

      fetchSpy.mockResolvedValue(buildJsonResponse({ error: 'unavailable' }, 503));

      const promise = retryClient.get('https://api.example.com/data');
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toBeInstanceOf(HttpError);
      // 1 initial + 2 retries = 3 total
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });

    it('should not retry on 4xx errors', async () => {
      fetchSpy.mockResolvedValue(buildJsonResponse({ error: 'not found' }, 404));

      const retryClient = new HttpClient({ maxRetries: 3 });
      await expect(
        retryClient.get('https://api.example.com/missing'),
      ).rejects.toBeInstanceOf(HttpError);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
