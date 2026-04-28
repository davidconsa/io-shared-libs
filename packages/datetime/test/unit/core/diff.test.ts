import { diff } from '../../../src/core/diff';
import { DateTimeError } from '../../../src/errors/datetime.error';
import { D_2024_JAN_15, D_2024_APR_15, D_2024_DEC_31 } from '../../fixtures/mock-dates';

describe('diff', () => {
  describe('days', () => {
    it('should return the exact number of full days between two dates', () => {
      const dateB = new Date(Date.UTC(2024, 0, 20, 12, 0, 0, 0)); // same time, 5 days later
      expect(diff(D_2024_JAN_15, dateB, 'days')).toBe(5);
    });

    it('should return a negative value when dateA is after dateB', () => {
      expect(diff(D_2024_APR_15, D_2024_JAN_15, 'days')).toBeLessThan(0);
    });

    it('should return 0 for identical dates', () => {
      expect(diff(D_2024_JAN_15, D_2024_JAN_15, 'days')).toBe(0);
    });

    it('should truncate partial days', () => {
      const dateA = new Date(Date.UTC(2024, 0, 15, 0, 0, 0));
      const dateB = new Date(Date.UTC(2024, 0, 16, 23, 59, 59)); // 1 full day + ~24h - 1s
      expect(diff(dateA, dateB, 'days')).toBe(1);
    });

    it('should compute diff across month boundaries', () => {
      const dateA = new Date(Date.UTC(2024, 0, 31));
      const dateB = new Date(Date.UTC(2024, 1, 3));
      expect(diff(dateA, dateB, 'days')).toBe(3);
    });

    it('should compute diff across year boundaries', () => {
      const dateA = new Date(Date.UTC(2024, 11, 31));
      const dateB = new Date(Date.UTC(2025, 0, 1));
      expect(diff(dateA, dateB, 'days')).toBe(1);
    });
  });

  describe('months', () => {
    it('should return calendar months between two dates', () => {
      expect(diff(D_2024_JAN_15, D_2024_APR_15, 'months')).toBe(3);
    });

    it('should return negative months when reversed', () => {
      expect(diff(D_2024_APR_15, D_2024_JAN_15, 'months')).toBe(-3);
    });

    it('should return 0 for same month', () => {
      const sameMonthLater = new Date(Date.UTC(2024, 0, 28));
      expect(diff(D_2024_JAN_15, sameMonthLater, 'months')).toBe(0);
    });

    it('should compute months across year boundary', () => {
      expect(diff(D_2024_JAN_15, D_2024_DEC_31, 'months')).toBe(11);
    });
  });

  describe('years', () => {
    it('should return calendar year difference', () => {
      const date2026 = new Date(Date.UTC(2026, 0, 15));
      expect(diff(D_2024_JAN_15, date2026, 'years')).toBe(2);
    });

    it('should return 0 for same year', () => {
      expect(diff(D_2024_JAN_15, D_2024_DEC_31, 'years')).toBe(0);
    });

    it('should return negative years when reversed', () => {
      const date2022 = new Date(Date.UTC(2022, 0, 15));
      expect(diff(D_2024_JAN_15, date2022, 'years')).toBe(-2);
    });
  });

  describe('error handling', () => {
    it('should throw DateTimeError for an invalid first argument', () => {
      expect(() => diff('bad', D_2024_JAN_15, 'days')).toThrow(DateTimeError);
    });

    it('should throw DateTimeError for an invalid second argument', () => {
      expect(() => diff(D_2024_JAN_15, 'bad', 'days')).toThrow(DateTimeError);
    });
  });
});
