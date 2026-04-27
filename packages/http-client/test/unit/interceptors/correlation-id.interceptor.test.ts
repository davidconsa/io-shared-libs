import {
  CORRELATION_ID_HEADER,
  createCorrelationIdInterceptor,
} from '../../../src/interceptors/correlation-id.interceptor';
import { buildMockRequest, buildMockResponse } from '../../fixtures/mock-data';

describe('createCorrelationIdInterceptor', () => {
  const mockResponse = buildMockResponse({ ok: true });

  it('should inject X-Correlation-ID into request headers', async () => {
    const fixedId = 'fixed-uuid-1234';
    const interceptor = createCorrelationIdInterceptor(() => fixedId);

    const next = jest.fn().mockResolvedValue(mockResponse);
    const request = buildMockRequest({ headers: {} });

    await interceptor.intercept(request, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          [CORRELATION_ID_HEADER]: fixedId,
        }),
      }),
    );
  });

  it('should generate a unique ID on each call', async () => {
    const ids: string[] = [];
    const interceptor = createCorrelationIdInterceptor(() => {
      const id = `id-${ids.length}`;
      ids.push(id);
      return id;
    });

    const next = jest.fn().mockResolvedValue(mockResponse);

    await interceptor.intercept(buildMockRequest({ headers: {} }), next);
    await interceptor.intercept(buildMockRequest({ headers: {} }), next);

    const calls = next.mock.calls as [{ headers: Record<string, string> }][];
    const firstId = calls[0]![0]!.headers[CORRELATION_ID_HEADER];
    const secondId = calls[1]![0]!.headers[CORRELATION_ID_HEADER];
    expect(firstId).not.toBe(secondId);
  });

  it('should not mutate the original request object', async () => {
    const interceptor = createCorrelationIdInterceptor(() => 'test-id');
    const next = jest.fn().mockResolvedValue(mockResponse);
    const original = buildMockRequest({ headers: {} });
    const headersBefore = { ...original.headers };

    await interceptor.intercept(original, next);

    expect(original.headers).toEqual(headersBefore);
  });

  it('should use crypto.randomUUID by default', async () => {
    const interceptor = createCorrelationIdInterceptor();
    const next = jest.fn().mockResolvedValue(mockResponse);
    await interceptor.intercept(buildMockRequest({ headers: {} }), next);

    const calls = next.mock.calls as [{ headers: Record<string, string> }][];
    const injectedId = calls[0]![0]!.headers[CORRELATION_ID_HEADER];
    expect(injectedId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
