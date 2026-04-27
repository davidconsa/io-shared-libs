import type { RequestMetadata } from '../types/error.types.js';
import { HttpClientError } from './http-client.error.js';

export class HttpError extends HttpClientError {
  readonly code = 'HTTP_ERROR';
  readonly statusCode: number;
  readonly responseBody: unknown;

  constructor(
    message: string,
    statusCode: number,
    metadata: RequestMetadata,
    responseBody?: unknown,
  ) {
    super(message, metadata);
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }
}
