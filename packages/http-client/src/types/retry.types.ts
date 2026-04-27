export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  shouldRetry: (error: unknown, attempt: number) => boolean;
}
