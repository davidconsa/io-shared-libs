import { assertValidDateInput } from '../validation/date.validator.js';
import type { DateInput } from '../types/datetime.types.js';

export function parseDate(input: DateInput): Date {
  assertValidDateInput(input);
  return new Date(input as string | number | Date);
}
