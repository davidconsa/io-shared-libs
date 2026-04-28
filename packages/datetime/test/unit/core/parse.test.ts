import { parseDate } from '../../../src/core/parse';
import { DateTimeError } from '../../../src/errors/datetime.error';
import { ISO_STRING, TIMESTAMP, D_2024_JAN_15 } from '../../fixtures/mock-dates';

describe('parseDate', () => {
  it('should parse a Date object (returns a new Date instance)', () => {
    const result = parseDate(D_2024_JAN_15);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(D_2024_JAN_15.getTime());
    expect(result).not.toBe(D_2024_JAN_15);
  });

  it('should parse a valid ISO string', () => {
    const result = parseDate(ISO_STRING);
    expect(result.getTime()).toBe(D_2024_JAN_15.getTime());
  });

  it('should parse a valid numeric timestamp', () => {
    const result = parseDate(TIMESTAMP);
    expect(result.getTime()).toBe(TIMESTAMP);
  });

  it('should parse timestamp 0 as Unix epoch', () => {
    const result = parseDate(0);
    expect(result.getTime()).toBe(0);
  });

  it('should throw DateTimeError for an invalid string', () => {
    expect(() => parseDate('not-a-date')).toThrow(DateTimeError);
  });

  it('should throw DateTimeError for NaN timestamp', () => {
    expect(() => parseDate(NaN)).toThrow(DateTimeError);
  });
});
