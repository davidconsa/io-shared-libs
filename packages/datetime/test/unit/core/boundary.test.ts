import { toStartOf, toEndOf } from '../../../src/core/boundary';
import { DateTimeError } from '../../../src/errors/datetime.error';
import { D_2024_JAN_15, D_2024_FEB_29, D_2024_DEC_31 } from '../../fixtures/mock-dates';

describe('toStartOf', () => {
  describe('day', () => {
    it('should return midnight UTC of the same day', () => {
      const result = toStartOf(D_2024_JAN_15, 'day');
      expect(result.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    it('should preserve the date when already at midnight', () => {
      const midnight = new Date(Date.UTC(2024, 0, 15, 0, 0, 0, 0));
      expect(toStartOf(midnight, 'day').toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });
  });

  describe('month', () => {
    it('should return the first day of the month at midnight UTC', () => {
      const result = toStartOf(D_2024_JAN_15, 'month');
      expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should work for a leap day month (February)', () => {
      const result = toStartOf(D_2024_FEB_29, 'month');
      expect(result.toISOString()).toBe('2024-02-01T00:00:00.000Z');
    });

    it('should work for December', () => {
      const result = toStartOf(D_2024_DEC_31, 'month');
      expect(result.toISOString()).toBe('2024-12-01T00:00:00.000Z');
    });
  });

  describe('year', () => {
    it('should return January 1st at midnight UTC', () => {
      const result = toStartOf(D_2024_JAN_15, 'year');
      expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should work from any month in the year', () => {
      const result = toStartOf(D_2024_DEC_31, 'year');
      expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  it('should throw DateTimeError for an invalid input', () => {
    expect(() => toStartOf('not-a-date', 'day')).toThrow(DateTimeError);
  });
});

describe('toEndOf', () => {
  describe('day', () => {
    it('should return 23:59:59.999 UTC of the same day', () => {
      const result = toEndOf(D_2024_JAN_15, 'day');
      expect(result.toISOString()).toBe('2024-01-15T23:59:59.999Z');
    });
  });

  describe('month', () => {
    it('should return the last millisecond of January (31 days)', () => {
      const result = toEndOf(D_2024_JAN_15, 'month');
      expect(result.toISOString()).toBe('2024-01-31T23:59:59.999Z');
    });

    it('should return last day of February in a leap year (29 days)', () => {
      const result = toEndOf(D_2024_FEB_29, 'month');
      expect(result.toISOString()).toBe('2024-02-29T23:59:59.999Z');
    });

    it('should return the last millisecond of December (31 days)', () => {
      const result = toEndOf(D_2024_DEC_31, 'month');
      expect(result.toISOString()).toBe('2024-12-31T23:59:59.999Z');
    });
  });

  describe('year', () => {
    it('should return December 31st at 23:59:59.999 UTC', () => {
      const result = toEndOf(D_2024_JAN_15, 'year');
      expect(result.toISOString()).toBe('2024-12-31T23:59:59.999Z');
    });

    it('should work from any month', () => {
      const result = toEndOf(D_2024_FEB_29, 'year');
      expect(result.toISOString()).toBe('2024-12-31T23:59:59.999Z');
    });
  });

  it('should throw DateTimeError for an invalid input', () => {
    expect(() => toEndOf('not-a-date', 'month')).toThrow(DateTimeError);
  });
});
