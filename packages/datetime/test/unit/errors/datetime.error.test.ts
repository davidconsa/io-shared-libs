import { DateTimeError } from '../../../src/errors/datetime.error';

describe('DateTimeError', () => {
  describe('constructor', () => {
    it('should set message, name, and default code', () => {
      const error = new DateTimeError('something went wrong');
      expect(error.message).toBe('something went wrong');
      expect(error.name).toBe('DateTimeError');
      expect(error.code).toBe('DATETIME_ERROR');
    });

    it('should accept a custom code', () => {
      const error = new DateTimeError('bad input', 'INVALID_DATE_INPUT');
      expect(error.code).toBe('INVALID_DATE_INPUT');
    });
  });

  describe('instanceof', () => {
    it('should be instanceof DateTimeError and Error', () => {
      const error = new DateTimeError('test');
      expect(error).toBeInstanceOf(DateTimeError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should survive Object.setPrototypeOf across ESM/CJS boundaries', () => {
      const error = new DateTimeError('test');
      // Verify prototype chain is intact
      expect(Object.getPrototypeOf(error)).toBe(DateTimeError.prototype);
    });
  });
});
