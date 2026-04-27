import type { HttpRequest, HttpResponse } from './http-client.types.js';

export type NextInterceptor = (request: HttpRequest) => Promise<HttpResponse<unknown>>;

export interface HttpInterceptor {
  intercept(
    request: HttpRequest,
    next: NextInterceptor,
  ): Promise<HttpResponse<unknown>>;
}
