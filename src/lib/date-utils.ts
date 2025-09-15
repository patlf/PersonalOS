/**
 * Date utility functions to ensure consistent date handling across the app
 * and avoid timezone-related issues in drag and drop functionality.
 */

/**
 * Normalizes a date to the start of the day in local timezone
 * This ensures consistent date comparisons regardless of time components
 */
export function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Creates a date string in YYYY-MM-DD format using local timezone
 * This avoids timezone issues when creating day IDs for drag and drop
 */
export function formatDateForId(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a date string in YYYY-MM-DD format to a Date object in local timezone
 * This ensures consistent parsing when handling drag and drop operations
 */
export function parseDateFromId(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date at noon to avoid any timezone edge cases
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Checks if two dates represent the same day (ignoring time components)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return startOfDay(date1).getTime() === startOfDay(date2).getTime();
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Checks if a date is in the past (before today)
 */
export function isPast(date: Date): boolean {
  const today = startOfDay(new Date());
  const compareDate = startOfDay(date);
  return compareDate < today;
}