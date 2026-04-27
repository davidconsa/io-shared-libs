import type { RetryConfig } from '../types/retry.types.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoffMs(attempt: number, config: RetryConfig): number {
  const exponential = config.baseDelayMs * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.1 * exponential;
  return Math.min(exponential + jitter, config.maxDelayMs);
}

/**
 * Wraps an async operation with retry logic.
 * Only retries when config.shouldRetry returns true for the thrown error.
 * Uses exponential backoff with jitter between attempts.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig,
): Promise<T> {
  let attempt = 0;

  for (;;) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      if (attempt > config.maxRetries || !config.shouldRetry(error, attempt)) {
        throw error;
      }

      await delay(calculateBackoffMs(attempt, config));
    }
  }
}
