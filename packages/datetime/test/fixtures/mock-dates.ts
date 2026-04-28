// All fixtures are UTC-anchored to prevent DST interference
export const D_2024_JAN_15 = new Date(Date.UTC(2024, 0, 15, 12, 0, 0, 0));   // 2024-01-15T12:00:00.000Z
export const D_2024_JAN_31 = new Date(Date.UTC(2024, 0, 31, 0, 0, 0, 0));    // 2024-01-31 (month-end, 31-day month)
export const D_2024_MAR_31 = new Date(Date.UTC(2024, 2, 31, 0, 0, 0, 0));    // 2024-03-31 (month-end, 31-day month)
export const D_2024_FEB_29 = new Date(Date.UTC(2024, 1, 29, 0, 0, 0, 0));    // 2024-02-29 (leap year)
export const D_2023_JAN_31 = new Date(Date.UTC(2023, 0, 31, 0, 0, 0, 0));    // 2023-01-31 (non-leap year)
export const D_2024_DEC_31 = new Date(Date.UTC(2024, 11, 31, 23, 59, 59, 999)); // 2024-12-31 (year-end)
export const D_2024_APR_15 = new Date(Date.UTC(2024, 3, 15, 0, 0, 0, 0));    // 2024-04-15 (30-day month)

export const ISO_STRING = '2024-01-15T12:00:00.000Z';
export const TIMESTAMP = 1705320000000; // 2024-01-15T12:00:00.000Z
