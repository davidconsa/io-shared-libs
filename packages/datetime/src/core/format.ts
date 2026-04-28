import { parseDate } from './parse.js';
import type { DateInput, FormatPattern } from '../types/datetime.types.js';

type IntlPattern = Exclude<FormatPattern, 'ISO' | 'DATE_ISO'>;

const PATTERN_OPTIONS: Record<IntlPattern, Intl.DateTimeFormatOptions> = {
  DATE: { day: '2-digit', month: '2-digit', year: 'numeric' },
  DATETIME: {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  },
  TIME: { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' },
};

export function format(input: DateInput, pattern: FormatPattern = 'ISO', locale = 'es-PE'): string {
  const date = parseDate(input);

  if (pattern === 'ISO') return date.toISOString();
  if (pattern === 'DATE_ISO') return date.toISOString().slice(0, 10);

  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    ...PATTERN_OPTIONS[pattern],
  }).format(date);
}
