import { isValidDateInput, assertValidDateInput } from '../../../src/validation/date.validator';
import { DateTimeError } from '../../../src/errors/datetime.error';
import { ISO_STRING, TIMESTAMP, D_2024_JAN_15 } from '../../fixtures/mock-dates';

describe('isValidDateInput', () => {
  it('should return true for a valid Date object', () => {
    expect(isValidDateInput(D_2024_JAN_15)).toBe(true);
  });

  it('should return true for a valid ISO string', () => {
    expect(isValidDateInput(ISO_STRING)).toBe(true);
  });

  it('should return true for a valid timestamp', () => {
    expect(isValidDateInput(TIMESTAMP)).toBe(true);
  });

  it('should return true for timestamp 0 (epoch)', () => {
    expect(isValidDateInput(0)).toBe(true);
  });

  it('should return false for an invalid string', () => {
    expect(isValidDateInput('not-a-date')).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(isValidDateInput('')).toBe(false);
  });

  it('should return false for NaN timestamp', () => {
    expect(isValidDateInput(NaN)).toBe(false);
  });
});

describe('assertValidDateInput', () => {
  it('should not throw for a valid input', () => {
    expect(() => assertValidDateInput(ISO_STRING)).not.toThrow();
  });

  it('should throw DateTimeError with INVALID_DATE_INPUT code for an invalid string', () => {
    expect(() => assertValidDateInput('garbage')).toThrow(DateTimeError);
  });

  it('should include the invalid value in the error message', () => {
    try {
      assertValidDateInput('garbage');
    } catch (err) {
      expect(err).toBeInstanceOf(DateTimeError);
      if (err instanceof DateTimeError) {
        expect(err.message).toContain('garbage');
        expect(err.code).toBe('INVALID_DATE_INPUT');
      }
    }
  });
});
