import { format } from '../../../src/core/format';
import { DateTimeError } from '../../../src/errors/datetime.error';
import { D_2024_JAN_15, ISO_STRING } from '../../fixtures/mock-dates';

describe('format', () => {
  describe('ISO pattern', () => {
    it('should return full ISO 8601 string', () => {
      expect(format(D_2024_JAN_15, 'ISO')).toBe('2024-01-15T12:00:00.000Z');
    });

    it('should default to ISO when no pattern is provided', () => {
      expect(format(ISO_STRING)).toBe('2024-01-15T12:00:00.000Z');
    });
  });

  describe('DATE_ISO pattern', () => {
    it('should return YYYY-MM-DD date-only string', () => {
      expect(format(D_2024_JAN_15, 'DATE_ISO')).toBe('2024-01-15');
    });
  });

  describe('DATE pattern', () => {
    it('should format as DD/MM/YYYY for en-US locale', () => {
      // en-US with day/month/year options → MM/DD/YYYY
      const result = format(D_2024_JAN_15, 'DATE', 'en-US');
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(result).toContain('2024');
      expect(result).toContain('01');
      expect(result).toContain('15');
    });

    it('should use UTC timezone (no DST shift)', () => {
      // Midnight UTC should remain on the same calendar day
      const midnight = new Date(Date.UTC(2024, 0, 15, 0, 0, 0, 0));
      const result = format(midnight, 'DATE_ISO');
      expect(result).toBe('2024-01-15');
    });
  });

  describe('DATETIME pattern', () => {
    it('should include date and 24-hour time components', () => {
      const result = format(D_2024_JAN_15, 'DATETIME', 'en-US');
      expect(result).toContain('2024');
      expect(result).toContain('12');
      expect(result).toContain('00');
    });
  });

  describe('TIME pattern', () => {
    it('should return only time in HH:mm:ss format', () => {
      const result = format(D_2024_JAN_15, 'TIME', 'en-US');
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
      expect(result).toBe('12:00:00');
    });
  });

  describe('input types', () => {
    it('should accept a numeric timestamp', () => {
      expect(format(1705320000000, 'DATE_ISO')).toBe('2024-01-15');
    });

    it('should accept an ISO string', () => {
      expect(format('2024-01-15T12:00:00.000Z', 'DATE_ISO')).toBe('2024-01-15');
    });
  });

  describe('error handling', () => {
    it('should throw DateTimeError for an invalid input', () => {
      expect(() => format('not-a-date', 'ISO')).toThrow(DateTimeError);
    });
  });
});
