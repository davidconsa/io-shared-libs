import { parseDate } from './parse.js';
import type { DateInput, BoundaryUnit } from '../types/datetime.types.js';

export function toStartOf(input: DateInput, unit: BoundaryUnit): Date {
  const d = parseDate(input);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();

  switch (unit) {
    case 'day':   return new Date(Date.UTC(y, m, d.getUTCDate(), 0, 0, 0, 0));
    case 'month': return new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
    case 'year':  return new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
  }
}

export function toEndOf(input: DateInput, unit: BoundaryUnit): Date {
  const d = parseDate(input);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();

  switch (unit) {
    case 'day':   return new Date(Date.UTC(y, m, d.getUTCDate(), 23, 59, 59, 999));
    case 'month': return new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
    case 'year':  return new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
  }
}
