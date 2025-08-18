import dayjs from "dayjs";
import { useAtomValue } from "jotai";
import { organizationAtom } from "src/atoms/organization";

// Default date formats for different preferences
export const DATE_FORMATS = {
  AUTO: null, // Use locale default
  "MM/DD/YYYY": "MM/DD/YYYY", // US format
  "DD/MM/YYYY": "DD/MM/YYYY", // UK/EU format
  "DD.MM.YYYY": "DD.MM.YYYY", // German format
  "YYYY-MM-DD": "YYYY-MM-DD", // ISO format
  "YYYY/MM/DD": "YYYY/MM/DD", // Japanese format
  "DD-MM-YYYY": "DD-MM-YYYY", // Alternative EU format
} as const;

export type DateFormatKey = keyof typeof DATE_FORMATS;

/**
 * Format a date according to user preference or locale default
 * @param date - The date to format (can be string, number, Date, or dayjs object)
 * @param customFormat - Optional custom format string to use
 * @param longFormat - If true, uses long format (LL), otherwise short format (L)
 * @returns Formatted date string
 */
export function formatDate(
  date: string | number | Date | dayjs.Dayjs,
  customFormat?: string | null,
  longFormat = false
): string {
  const dateObj = dayjs(date);
  
  // If a custom format is provided, use it
  if (customFormat && customFormat !== "AUTO") {
    return dateObj.format(customFormat);
  }
  
  // Otherwise, use locale-based format
  return dateObj.format(longFormat ? "LL" : "L");
}

/**
 * Hook to get a date formatter function that uses organization preferences
 */
export function useDateFormatter() {
  const organization = useAtomValue(organizationAtom);
  
  return (date: string | number | Date | dayjs.Dayjs, longFormat = false) => {
    return formatDate(date, organization?.date_format, longFormat);
  };
}

/**
 * Hook to get the date picker format from organization settings
 * Returns the custom format or a default format string for DatePicker components
 */
export function useDatePickerFormat() {
  const organization = useAtomValue(organizationAtom);
  
  // If a custom format is set, use it
  if (organization?.date_format && organization.date_format !== "AUTO") {
    return organization.date_format;
  }
  
  // Otherwise return the default format that dayjs uses for locale
  // This ensures DatePicker always has a valid format string
  return "L"; // This will use the locale's default short date format
}

/**
 * Hook to get the datetime picker format from organization settings
 * Returns the custom format with time or a default format string for DatePicker components with time
 */
export function useDateTimePickerFormat() {
  const organization = useAtomValue(organizationAtom);
  
  // If a custom format is set, append time format to it
  if (organization?.date_format && organization.date_format !== "AUTO") {
    return `${organization.date_format} HH:mm`;
  }
  
  // Otherwise return the default datetime format
  return "L HH:mm"; // This will use the locale's default short date format with time
}

/**
 * Get display label for date format
 * @param format - The date format key
 * @returns Display label with example
 */
export function getDateFormatLabel(format: DateFormatKey): string {
  const today = dayjs();
  
  if (format === "AUTO") {
    return `Auto (${today.format("L")})`;
  }
  
  const formatString = DATE_FORMATS[format];
  return formatString ? `${format} (${today.format(formatString)})` : format;
}