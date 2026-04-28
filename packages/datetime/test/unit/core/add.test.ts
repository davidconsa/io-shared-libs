import { add } from '../../../src/core/add';
import { DateTimeError } from '../../../src/errors/datetime.error';
import {
  D_2024_JAN_15,
  D_2024_JAN_31,
  D_2023_JAN_31,
  D_2024_MAR_31,
  D_2024_DEC_31,
} from '../../fixtures/mock-dates';

describe('add', () => {
  describe('days', () => {
    it('should add positive days', () => {
      const result = add(D_2024_JAN_15, { days: 5 });
      expect(result.toISOString().slice(0, 10)).toBe('2024-01-20');
    });

    it('should add days crossing a month boundary', () => {
      const result = add(D_2024_JAN_31, { days: 1 });
      expect(result.toISOString().slice(0, 10)).toBe('2024-02-01');
    });

    it('should add days crossing a year boundary', () => {
      const result = add(D_2024_DEC_31, { days: 1 });
      expect(result.toISOString().slice(0, 10)).toBe('2025-01-01');
    });

    it('should handle negative days', () => {
      const result = add(D_2024_JAN_15, { days: -5 });
      expect(result.toISOString().slice(0, 10)).toBe('2024-01-10');
    });

    it('should return a new Date (immutability)', () => {
      const result = add(D_2024_JAN_15, { days: 1 });
      expect(result).not.toBe(D_2024_JAN_15);
      expect(D_2024_JAN_15.toISOString().slice(0, 10)).toBe('2024-01-15');
    });
  });

  describe('months', () => {
    it('should add positive months', () => {
      const result = add(D_2024_JAN_15, { months: 2 });
      expect(result.toISOString().slice(0, 10)).toBe('2024-03-15');
    });

    it('should add months crossing a year boundary', () => {
      const result = add(D_2024_JAN_15, { months: 12 });
      expect(result.toISOString().slice(0, 10)).toBe('2025-01-15');
    });

    it('should clamp Jan 31 + 1 month to Feb 29 in a leap year', () => {
      const result = add(D_2024_JAN_31, { months: 1 });
      expect(result.toISOString().slice(0, 10)).toBe('2024-02-29');
    });

    it('should clamp Jan 31 + 1 month to Feb 28 in a non-leap year', () => {
      const result = add(D_2023_JAN_31, { months: 1 });
      expect(result.toISOString().slice(0, 10)).toBe('2023-02-28');
    });

    it('should clamp Mar 31 + 1 month to Apr 30', () => {
      const result = add(D_2024_MAR_31, { months: 1 });
      expect(result.toISOString().slice(0, 10)).toBe('2024-04-30');
    });

    it('should handle negative months', () => {
      const result = add(D_2024_JAN_15, { months: -1 });
      expect(result.toISOString().slice(0, 10)).toBe('2023-12-15');
    });
  });

  describe('years', () => {
    it('should add positive years', () => {
      const result = add(D_2024_JAN_15, { years: 1 });
      expect(result.toISOString().slice(0, 10)).toBe('2025-01-15');
    });

    it('should handle negative years', () => {
      const result = add(D_2024_JAN_15, { years: -1 });
      expect(result.toISOString().slice(0, 10)).toBe('2023-01-15');
    });

    it('should clamp Feb 29 (leap) + 1 year to Feb 28 (non-leap)', () => {
      const leapDay = new Date(Date.UTC(2024, 1, 29));
      const result = add(leapDay, { years: 1 });
      expect(result.toISOString().slice(0, 10)).toBe('2025-02-28');
    });
  });

  describe('combined duration', () => {
    it('should add years + months + days together', () => {
      const result = add(D_2024_JAN_15, { years: 1, months: 2, days: 10 });
      expect(result.toISOString().slice(0, 10)).toBe('2025-03-25');
    });

    it('should preserve time components', () => {
      const result = add(D_2024_JAN_15, { days: 1 });
      expect(result.getUTCHours()).toBe(12);
      expect(result.getUTCMinutes()).toBe(0);
    });

    it('should handle empty duration (no-op)', () => {
      const result = add(D_2024_JAN_15, {});
      expect(result.getTime()).toBe(D_2024_JAN_15.getTime());
    });
  });

  describe('error handling', () => {
    it('should throw DateTimeError for an invalid input', () => {
      expect(() => add('not-a-date', { days: 1 })).toThrow(DateTimeError);
    });
  });
});
