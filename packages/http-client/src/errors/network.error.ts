import type { RequestMetadata } from '../types/error.types.js';
import { HttpClientError } from './http-client.error.js';

export class NetworkError extends HttpClientError {
  readonly code = 'NETWORK_ERROR';

  constructor(message: string, metadata: RequestMetadata, cause?: unknown) {
    super(message, metadata);
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}
