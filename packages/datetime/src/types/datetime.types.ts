export type DateInput = Date | string | number;

export type DiffUnit = 'days' | 'months' | 'years';

export type BoundaryUnit = 'day' | 'month' | 'year';

export type FormatPattern = 'ISO' | 'DATE' | 'DATE_ISO' | 'DATETIME' | 'TIME';

export interface Duration {
  days?: number;
  months?: number;
  years?: number;
}
