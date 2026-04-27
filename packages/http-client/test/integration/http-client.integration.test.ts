import { createHttpClient } from '../../src/index';
import { HttpError } from '../../src/errors/http.error';
import { CORRELATION_ID_HEADER } from '../../src/interceptors/correlation-id.interceptor';
import { buildJsonResponse } from '../fixtures/mock-data';

const fetchSpy = jest.spyOn(globalThis, 'fetch');

describe('HttpClient integration', () => {
  afterEach(() => {
    fetchSpy.mockReset();
  });

  describe('X-Correlation-ID injection', () => {
    it('should inject a valid UUID on every request', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({ status: 'ok' }));

      const client = createHttpClient();
      await client.get('https://api.example.com/health');

      const [, init] = fetchSpy.mock.calls[0]!;
      const headers = init?.headers as Record<string, string>;

      expect(headers[CORRELATION_ID_HEADER]).toBeDefined();
      expect(headers[CORRELATION_ID_HEADER]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should inject a different correlation ID per request', async () => {
      fetchSpy.mockResolvedValue(buildJsonResponse({}));

      const client = createHttpClient();
      await client.get('https://api.example.com/a');
      await client.get('https://api.example.com/b');

      const calls = fetchSpy.mock.calls as [string, RequestInit][];
      const id1 = (calls[0]![1]!.headers as Record<string, string>)[CORRELATION_ID_HEADER];
      const id2 = (calls[1]![1]!.headers as Record<string, string>)[CORRELATION_ID_HEADER];

      expect(id1).not.toBe(id2);
    });
  });

  describe('retry on 5xx', () => {
    it('should retry and eventually throw HttpError after exhausting attempts', async () => {
      jest.useFakeTimers();
      fetchSpy.mockResolvedValue(
        buildJsonResponse({ error: 'unavailable' }, 503),
      );

      const client = createHttpClient({ maxRetries: 2, baseDelayMs: 10 });
      const promise = client.get('https://api.example.com/data');
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toBeInstanceOf(HttpError);
      // 1 initial + 2 retries = 3 calls
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });
  });

  describe('defaultHeaders', () => {
    it('should send default headers on every request', async () => {
      fetchSpy.mockResolvedValueOnce(buildJsonResponse({}));

      const client = createHttpClient({
        defaultHeaders: { 'X-App-Version': '1.0.0' },
      });

      await client.get('https://api.example.com/health');

      const [, init] = fetchSpy.mock.calls[0]!;
      const headers = init?.headers as Record<string, string>;
      expect(headers['X-App-Version']).toBe('1.0.0');
    });
  });
});
