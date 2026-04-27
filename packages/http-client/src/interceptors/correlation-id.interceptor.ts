import type { HttpInterceptor, NextInterceptor } from '../types/interceptor.types.js';
import type { HttpRequest, HttpResponse } from '../types/http-client.types.js';

export const CORRELATION_ID_HEADER = 'X-Correlation-ID';

export function createCorrelationIdInterceptor(
  generateId: () => string = () => crypto.randomUUID(),
): HttpInterceptor {
  return {
    intercept(
      request: HttpRequest,
      next: NextInterceptor,
    ): Promise<HttpResponse<unknown>> {
      const enriched: HttpRequest = {
        ...request,
        headers: {
          ...request.headers,
          [CORRELATION_ID_HEADER]: generateId(),
        },
      };
      return next(enriched);
    },
  };
}
