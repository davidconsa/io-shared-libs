import type { RequestMetadata } from '../types/error.types.js';
import { HttpClientError } from './http-client.error.js';

export class TimeoutError extends HttpClientError {
  readonly code = 'TIMEOUT_ERROR';
  readonly timeoutMs: number;

  constructor(timeoutMs: number, metadata: RequestMetadata) {
    super(`Request timed out after ${timeoutMs}ms`, metadata);
    this.timeoutMs = timeoutMs;
  }
}
