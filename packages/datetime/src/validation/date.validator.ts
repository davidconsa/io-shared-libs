import { DateTimeError } from '../errors/datetime.error.js';
import type { DateInput } from '../types/datetime.types.js';

export function isValidDateInput(input: DateInput): boolean {
  return !isNaN(new Date(input as string | number | Date).getTime());
}

export function assertValidDateInput(input: DateInput): void {
  if (!isValidDateInput(input)) {
    throw new DateTimeError(
      `Invalid date input: "${String(input)}"`,
      'INVALID_DATE_INPUT',
    );
  }
}
