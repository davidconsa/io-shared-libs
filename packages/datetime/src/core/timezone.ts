import { parseDate } from './parse.js';
import type { DateInput } from '../types/datetime.types.js';

const DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
};

export function toTimezone(input: DateInput, timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    ...DATETIME_OPTIONS,
    timeZone: timezone,
  }).format(parseDate(input));
}

export function toLima(input: DateInput): string {
  return toTimezone(input, 'America/Lima');
}
