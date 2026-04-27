import { withRetry } from '../../../src/retry/retry.strategy';
import type { RetryConfig } from '../../../src/types/retry.types';

const neverRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 0,
  maxDelayMs: 0,
  shouldRetry: () => false,
};

const alwaysRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 0,
  maxDelayMs: 0,
  shouldRetry: () => true,
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

      await expect(withRetry(fn, neverRetryConfig)).rejects.toBeInstanceOf(TypeError);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('when fn always throws a retryable error', () => {
    it('should retry up to maxRetries and then throw', async () => {
      const error = new Error('Retryable error');
      const fn = jest.fn().mockRejectedValue(error);

      await expect(withRetry(fn, alwaysRetryConfig)).rejects.toThrow('Retryable error');
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

      await expect(withRetry(fn, alwaysRetryConfig)).resolves.toBe('success-on-retry');
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

      await expect(withRetry(fn, config)).rejects.toBe(targetError);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
