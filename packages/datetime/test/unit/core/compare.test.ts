import { isBefore, isAfter } from '../../../src/core/compare';
import { DateTimeError } from '../../../src/errors/datetime.error';
import { D_2024_JAN_15, D_2024_APR_15 } from '../../fixtures/mock-dates';

describe('isBefore', () => {
  it('should return true when input is earlier than reference', () => {
    expect(isBefore(D_2024_JAN_15, D_2024_APR_15)).toBe(true);
  });

  it('should return false when input is later than reference', () => {
    expect(isBefore(D_2024_APR_15, D_2024_JAN_15)).toBe(false);
  });

  it('should return false for equal dates', () => {
    expect(isBefore(D_2024_JAN_15, D_2024_JAN_15)).toBe(false);
  });

  it('should accept ISO strings', () => {
    expect(isBefore('2024-01-01T00:00:00Z', '2024-06-01T00:00:00Z')).toBe(true);
  });

  it('should accept numeric timestamps', () => {
    expect(isBefore(1000, 2000)).toBe(true);
  });

  it('should throw DateTimeError for an invalid input', () => {
    expect(() => isBefore('bad', D_2024_JAN_15)).toThrow(DateTimeError);
  });
});

describe('isAfter', () => {
  it('should return true when input is later than reference', () => {
    expect(isAfter(D_2024_APR_15, D_2024_JAN_15)).toBe(true);
  });

  it('should return false when input is earlier than reference', () => {
    expect(isAfter(D_2024_JAN_15, D_2024_APR_15)).toBe(false);
  });

  it('should return false for equal dates', () => {
    expect(isAfter(D_2024_JAN_15, D_2024_JAN_15)).toBe(false);
  });

  it('should accept ISO strings', () => {
    expect(isAfter('2024-06-01T00:00:00Z', '2024-01-01T00:00:00Z')).toBe(true);
  });

  it('should throw DateTimeError for an invalid reference', () => {
    expect(() => isAfter(D_2024_JAN_15, 'bad')).toThrow(DateTimeError);
  });
});
