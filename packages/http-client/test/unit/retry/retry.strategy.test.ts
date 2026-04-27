import { withRetry } from '../../../src/retry/retry.strategy';
import type { RetryConfig } from '../../../src/types/retry.types';

jest.useFakeTimers();

const alwaysRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5_000,
  shouldRetry: () => true,
};

const neverRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 100,
  maxDelayMs: 5_000,
  shouldRetry: () => false,
};

describe('withRetry', () => {
  describe('when fn succeeds on first attempt', () => {
    it('should return the result without retrying', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await withRetry(fn, neverRetryConfig);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('when fn always throws with a non-retryable error', () => {
    it('should throw immediately without retrying', async () => {
      const fn = jest.fn().mockRejectedValue(new TypeError('Not retryable'));
      const promise = withRetry(fn, neverRetryConfig);
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toBeInstanceOf(TypeError);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('when fn always throws a retryable error', () => {
    it('should retry up to maxRetries and then throw', async () => {
      const error = new Error('Retryable error');
      const fn = jest.fn().mockRejectedValue(error);

      const promise = withRetry(fn, alwaysRetryConfig);
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Retryable error');
      // 1 initial attempt + 3 retries = 4 total
      expect(fn).toHaveBeenCalledTimes(4);
    });
  });

  describe('when fn succeeds on a retry attempt', () => {
    it('should return the successful result', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('first failure'))
        .mockResolvedValueOnce('success-on-retry');

      const promise = withRetry(fn, alwaysRetryConfig);
      await jest.runAllTimersAsync();

      await expect(promise).resolves.toBe('success-on-retry');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('when shouldRetry returns false for a specific error', () => {
    it('should not retry and rethrow the error immediately', async () => {
      const targetError = new Error('specific error');
      const config: RetryConfig = {
        ...alwaysRetryConfig,
        shouldRetry: (err) => err !== targetError,
      };
      const fn = jest.fn().mockRejectedValue(targetError);

      const promise = withRetry(fn, config);
      await jest.runAllTimersAsync();

      await expect(promise).rejects.toBe(targetError);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
