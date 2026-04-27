import { assertHttpsUrl } from '../../../src/validation/url.validator';

describe('assertHttpsUrl', () => {
  describe('valid HTTPS URLs', () => {
    it('should not throw for a valid https URL', () => {
      expect(() => assertHttpsUrl('https://api.example.com/users')).not.toThrow();
    });

    it('should not throw for https URL with port and query', () => {
      expect(() =>
        assertHttpsUrl('https://api.example.com:8443/v1/users?page=1'),
      ).not.toThrow();
    });
  });

  describe('invalid URLs', () => {
    it('should throw for http protocol', () => {
      expect(() => assertHttpsUrl('http://insecure.example.com')).toThrow(
        /Blocked non-HTTPS protocol/,
      );
    });

    it('should throw for ftp protocol', () => {
      expect(() => assertHttpsUrl('ftp://files.example.com')).toThrow(
        /Blocked non-HTTPS protocol/,
      );
    });

    it('should throw for completely invalid URL strings', () => {
      expect(() => assertHttpsUrl('not-a-url')).toThrow(/Invalid URL/);
    });

    it('should throw for empty string', () => {
      expect(() => assertHttpsUrl('')).toThrow();
    });
  });
});
