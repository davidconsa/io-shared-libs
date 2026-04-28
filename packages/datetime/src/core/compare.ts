import { parseDate } from './parse.js';
import type { DateInput } from '../types/datetime.types.js';

export function isBefore(input: DateInput, reference: DateInput): boolean {
  return parseDate(input).getTime() < parseDate(reference).getTime();
}

export function isAfter(input: DateInput, reference: DateInput): boolean {
  return parseDate(input).getTime() > parseDate(reference).getTime();
}
