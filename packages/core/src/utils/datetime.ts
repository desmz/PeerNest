export const MONTHS_NUMBER = 12;
export const CURRENT_YEAR = new Date().getFullYear();
export const CURRENT_MONTH = new Date().getMonth();

export const MONTH_WITH_MAX_DAYS = 3;

/**
 * Generates a string with the current timestamp in the format 'dd/mm/yyyy hh:mm:ss'.
 * @returns a string with the current timestamp in the format 'dd/mm/yyyy hh:mm:ss'
 */
export function generateTimestamp(): string {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  } as Intl.DateTimeFormatOptions;

  return new Intl.DateTimeFormat('en-GB', options).format(new Date());
}

/**
 * Generates an array of strings with the years in the range [startYear, endYear] inclusively.
 * @param startYear The start year of the years range. Default is 100 years ago from the current year.
 * @param endYear The end year of the years range. Default is the current year.
 * @returns An array of strings with the years in the range [startYear, endYear] inclusively.
 */
export function generateYears(
  startYear: number = CURRENT_YEAR - 100,
  endYear: number = CURRENT_YEAR
): string[] {
  return Array.from({ length: endYear - startYear + 1 }, (_v, k) => String(startYear + k));
}

/**
 * Generates an array of strings with the months in the format specified by the `format` parameter.
 * @param format The format to use. Default is 'long'.
 * @param locale The locale to use. Default is 'en-US'.
 * @returns An array of strings with the months in the format specified by the `format` parameter.
 */
export function generateMonths(
  format: Intl.DateTimeFormatOptions['month'] = 'long',
  locale: Intl.LocalesArgument = 'en-US'
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: format });

  const months = Array.from({ length: MONTHS_NUMBER }, (_v, k) => {
    const date = new Date(CURRENT_YEAR, k); // choose an arbitrary year
    return formatter.format(date);
  });

  return months;
}

/**
 * Generates an array of strings with the days in the month specified by the `year` and `month` parameters.
 * @param year The year of the month. Default is the current year.
 * @param month The month to get the days from. Default is the current month.
 * @param locale The locale to use. Default is 'en-US'.
 * @returns An array of strings with the days in the month specified by the `year` and `month` parameters.
 */
export function generateDays(
  year: number = CURRENT_YEAR,
  month: number = CURRENT_MONTH,
  locale: Intl.LocalesArgument = 'en-US'
): string[] {
  const daysInMonth = new Date(year, month, 0).getDate(); // get the last day of the month
  const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric' });

  const days = Array.from({ length: daysInMonth }, (_v, k) => {
    const date = new Date(year, month - 1, k + 1);
    return formatter.format(date);
  });

  return days;
}

/**
 * Gets the number of the month specified by the `monthName` parameter.
 * @param monthName  The name of the month to get the number from. (e.g. 'January', 'February', etc.)
 * @param locale The locale to use. Default is 'en-US'.
 * @returns  The number of the month specified by the `monthName` parameter.
 */
export function getMonthNumber(monthName: string, locale: Intl.LocalesArgument = 'en-US') {
  const date = new Date(`${monthName} 1, 2000`); // Create a date with the given month

  if (isNaN(date.getTime())) {
    throw new Error('Invalid month name');
  }

  return new Intl.DateTimeFormat(locale, { month: '2-digit' }).format(date);
}
