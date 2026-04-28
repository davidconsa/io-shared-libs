import { parseDate } from './parse.js';
import type { DateInput, Duration } from '../types/datetime.types.js';

export function add(input: DateInput, duration: Duration): Date {
  const date = parseDate(input);

  let year = date.getUTCFullYear();
  let month = date.getUTCMonth();
  const day = date.getUTCDate();

  year += duration.years ?? 0;
  month += duration.months ?? 0;

  // Normalize month overflow (handles negative months too)
  year += Math.floor(month / 12);
  month = ((month % 12) + 12) % 12;

  // Clamp day to last valid day in resulting month (e.g. Jan 31 + 1mo = Feb 28/29)
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, daysInMonth);

  const result = new Date(
    Date.UTC(year, month, clampedDay,
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds(),
    ),
  );

  if (duration.days !== undefined && duration.days !== 0) {
    result.setUTCDate(result.getUTCDate() + duration.days);
  }

  return result;
}
