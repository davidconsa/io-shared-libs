import { HttpError } from '../../../src/errors/http.error';
import { HttpClientError } from '../../../src/errors/http-client.error';
import { buildMockMetadata } from '../../fixtures/mock-data';

describe('HttpError', () => {
  const metadata = buildMockMetadata();

  describe('constructor', () => {
    it('should set all properties correctly', () => {
      const responseBody = { error: 'NOT_FOUND' };
      const error = new HttpError('Not Found', 404, metadata, responseBody);

      expect(error.message).toBe('Not Found');
      expect(error.statusCode).toBe(404);
      expect(error.metadata).toEqual(metadata);
      expect(error.responseBody).toEqual(responseBody);
      expect(error.name).toBe('HttpError');
      expect(error.code).toBe('HTTP_ERROR');
    });

    it('should support undefined responseBody', () => {
      const error = new HttpError('Internal Error', 500, metadata);
      expect(error.responseBody).toBeUndefined();
    });
  });

  describe('instanceof', () => {
    it('should be instanceof HttpError and HttpClientError', () => {
      const error = new HttpError('Bad Request', 400, metadata);
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toBeInstanceOf(HttpClientError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('isClientError', () => {
    it('should return true for 4xx status codes', () => {
      expect(new HttpError('', 400, metadata).isClientError).toBe(true);
      expect(new HttpError('', 404, metadata).isClientError).toBe(true);
      expect(new HttpError('', 499, metadata).isClientError).toBe(true);
    });

    it('should return false for 5xx status codes', () => {
      expect(new HttpError('', 500, metadata).isClientError).toBe(false);
    });

    it('should return false for 2xx status codes', () => {
      expect(new HttpError('', 200, metadata).isClientError).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should return true for 5xx status codes', () => {
      expect(new HttpError('', 500, metadata).isServerError).toBe(true);
      expect(new HttpError('', 503, metadata).isServerError).toBe(true);
      expect(new HttpError('', 599, metadata).isServerError).toBe(true);
    });

    it('should return false for 4xx status codes', () => {
      expect(new HttpError('', 404, metadata).isServerError).toBe(false);
    });
  });

  describe('metadata', () => {
    it('should freeze metadata to prevent mutation', () => {
      const error = new HttpError('error', 500, metadata);
      expect(Object.isFrozen(error.metadata)).toBe(true);
    });
  });
});
