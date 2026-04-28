import { parseDate } from './parse.js';
import type { DateInput, DiffUnit } from '../types/datetime.types.js';

const MS_PER_DAY = 86_400_000;

export function diff(inputA: DateInput, inputB: DateInput, unit: DiffUnit): number {
  const dateA = parseDate(inputA);
  const dateB = parseDate(inputB);

  if (unit === 'days') {
    return Math.trunc((dateB.getTime() - dateA.getTime()) / MS_PER_DAY);
  }

  const yearDiff = dateB.getUTCFullYear() - dateA.getUTCFullYear();
  const monthDiff = dateB.getUTCMonth() - dateA.getUTCMonth();

  if (unit === 'months') {
    return yearDiff * 12 + monthDiff;
  }

  return yearDiff;
}
