import type { RequestMetadata } from '../types/error.types.js';

export abstract class HttpClientError extends Error {
  abstract readonly code: string;
  readonly metadata: Readonly<RequestMetadata>;

  constructor(message: string, metadata: RequestMetadata) {
    super(message);
    this.name = new.target.name;
    this.metadata = Object.freeze({ ...metadata });
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
