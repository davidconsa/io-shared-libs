import { mock } from 'jest-mock-extended';
import { buildInterceptorChain } from '../../../src/interceptors/interceptor-pipeline';
import type { HttpInterceptor, NextInterceptor } from '../../../src/types/interceptor.types';
import { buildMockRequest, buildMockResponse, } from '../../fixtures/mock-data';

describe('buildInterceptorChain', () => {
  const mockUserResponse = buildMockResponse({ id: '1', name: 'Ada' });

  describe('with no interceptors', () => {
    it('should call execute directly', async () => {
      const execute = jest.fn().mockResolvedValue(mockUserResponse);
      const chain = buildInterceptorChain([], execute);
      const result = await chain(buildMockRequest());

      expect(execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('with a single interceptor', () => {
    it('should execute in order: before → execute → after', async () => {
      const callOrder: string[] = [];
      const mockInterceptor = mock<HttpInterceptor>();

      const execute = jest.fn().mockImplementation(async () => {
        callOrder.push('execute');
        return mockUserResponse;
      });

      mockInterceptor.intercept.mockImplementation(
        async (req, next: NextInterceptor) => {
          callOrder.push('interceptor-before');
          const res = await next(req);
          callOrder.push('interceptor-after');
          return res;
        },
      );

      const chain = buildInterceptorChain([mockInterceptor], execute);
      await chain(buildMockRequest());

      expect(callOrder).toEqual([
        'interceptor-before',
        'execute',
        'interceptor-after',
      ]);
    });
  });

  describe('with multiple interceptors', () => {
    it('should wrap in order: A outermost, B innermost', async () => {
      const callOrder: string[] = [];
      const mockInterceptorA = mock<HttpInterceptor>();
      const mockInterceptorB = mock<HttpInterceptor>();

      const execute = jest.fn().mockImplementation(async () => {
        callOrder.push('execute');
        return mockUserResponse;
      });

      mockInterceptorA.intercept.mockImplementation(
        async (req, next: NextInterceptor) => {
          callOrder.push('A-before');
          const res = await next(req);
          callOrder.push('A-after');
          return res;
        },
      );

      mockInterceptorB.intercept.mockImplementation(
        async (req, next: NextInterceptor) => {
          callOrder.push('B-before');
          const res = await next(req);
          callOrder.push('B-after');
          return res;
        },
      );

      const chain = buildInterceptorChain(
        [mockInterceptorA, mockInterceptorB],
        execute,
      );
      await chain(buildMockRequest());

      expect(callOrder).toEqual([
        'A-before',
        'B-before',
        'execute',
        'B-after',
        'A-after',
      ]);
    });

    it('should allow an interceptor to short-circuit without calling next', async () => {
      const cachedResponse = buildMockResponse({ id: 'cached' });
      const execute = jest.fn();
      const mockInterceptor = mock<HttpInterceptor>();

      mockInterceptor.intercept.mockResolvedValue(cachedResponse);

      const chain = buildInterceptorChain([mockInterceptor], execute);
      const result = await chain(buildMockRequest());

      expect(result).toEqual(cachedResponse);
      expect(execute).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by an interceptor', async () => {
      const execute = jest.fn();
      const mockInterceptor = mock<HttpInterceptor>();

      mockInterceptor.intercept.mockRejectedValue(new Error('Auth failure'));

      const chain = buildInterceptorChain([mockInterceptor], execute);

      await expect(chain(buildMockRequest())).rejects.toThrow('Auth failure');
      expect(execute).not.toHaveBeenCalled();
    });
  });
});
