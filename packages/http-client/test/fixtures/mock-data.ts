import type { HttpRequest, HttpResponse } from '../../src/types/http-client.types';
import type { RequestMetadata } from '../../src/types/error.types';

export const MOCK_VALID_URL = 'https://api.example.com/users';
export const MOCK_CORRELATION_ID = 'test-correlation-id-1234';

export function buildMockRequest(overrides?: Partial<HttpRequest>): HttpRequest {
  return {
    url: MOCK_VALID_URL,
    method: 'GET',
    headers: { 'X-Correlation-ID': MOCK_CORRELATION_ID },
    ...overrides,
  };
}

export function buildMockResponse<T>(
  data: T,
  overrides?: Partial<HttpResponse<T>>,
): HttpResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    correlationId: MOCK_CORRELATION_ID,
    durationMs: 42,
    url: MOCK_VALID_URL,
    ...overrides,
  };
}

export function buildMockMetadata(
  overrides?: Partial<RequestMetadata>,
): RequestMetadata {
  return {
    url: MOCK_VALID_URL,
    method: 'GET',
    correlationId: MOCK_CORRELATION_ID,
    durationMs: 42,
    attempt: 1,
    ...overrides,
  };
}

export function buildJsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
