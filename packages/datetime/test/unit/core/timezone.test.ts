import { toTimezone, toLima } from '../../../src/core/timezone';
import { DateTimeError } from '../../../src/errors/datetime.error';
import { D_2024_JAN_15 } from '../../fixtures/mock-dates';

// America/Lima is UTC-5, no DST — deterministic offset year-round
describe('toLima', () => {
  it('should shift UTC time by -5 hours', () => {
    // D_2024_JAN_15 is 2024-01-15T12:00:00Z → Lima: 07:00:00
    const result = toLima(D_2024_JAN_15);
    expect(result).toContain('07:00:00');
    expect(result).toContain('2024');
    expect(result).toContain('01');
    expect(result).toContain('15');
  });

  it('should shift a midnight UTC date to the previous day in Lima', () => {
    // 2024-01-15T00:00:00Z → Lima: 2024-01-14T19:00:00
    const midnightUtc = new Date(Date.UTC(2024, 0, 15, 0, 0, 0, 0));
    const result = toLima(midnightUtc);
    expect(result).toContain('19:00:00');
    expect(result).toContain('14');
  });

  it('should accept an ISO string', () => {
    const result = toLima('2024-01-15T17:00:00Z');
    // UTC 17:00 → Lima 12:00
    expect(result).toContain('12:00:00');
  });

  it('should accept a numeric timestamp', () => {
    const result = toLima(1705320000000); // 2024-01-15T12:00:00Z
    expect(result).toContain('07:00:00');
  });

  it('should throw DateTimeError for an invalid input', () => {
    expect(() => toLima('not-a-date')).toThrow(DateTimeError);
  });
});

describe('toTimezone', () => {
  it('should convert to a given IANA timezone', () => {
    // UTC+0 → same time
    const result = toTimezone(D_2024_JAN_15, 'UTC');
    expect(result).toContain('12:00:00');
  });

  it('should handle positive offset timezones (e.g. Asia/Tokyo UTC+9)', () => {
    // 2024-01-15T12:00:00Z → Tokyo: 2024-01-15T21:00:00+09:00
    const result = toTimezone(D_2024_JAN_15, 'Asia/Tokyo');
    expect(result).toContain('21:00:00');
  });

  it('should throw DateTimeError for an invalid date input', () => {
    expect(() => toTimezone('bad', 'America/Lima')).toThrow(DateTimeError);
  });
});
