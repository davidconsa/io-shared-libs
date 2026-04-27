import type { HttpInterceptor, NextInterceptor } from '../types/interceptor.types.js';
import type { HttpRequest, HttpResponse } from '../types/http-client.types.js';

/**
 * Builds a middleware chain from an array of interceptors and a terminal
 * execute function. The first interceptor is the outermost wrapper.
 *
 * Execution order with [A, B] and execute:
 *   A-before → B-before → execute → B-after → A-after
 */
export function buildInterceptorChain(
  interceptors: HttpInterceptor[],
  execute: (request: HttpRequest) => Promise<HttpResponse<unknown>>,
): (request: HttpRequest) => Promise<HttpResponse<unknown>> {
  return interceptors.reduceRight<NextInterceptor>(
    (next, interceptor) =>
      (request: HttpRequest) =>
        interceptor.intercept(request, next),
    execute,
  );
}
