import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

/**
 * Universal Date Helper
 * Provides consistent date formatting and manipulation across the entire application
 */
export const dateHelper = {
  
  /**
   * Format date for backend API (yyyy-MM-dd format required by backend)
   * @param {Date|string|dayjs} date - Date to format
   * @returns {string} - Formatted date string (yyyy-MM-dd)
   */
  formatForAPI: (date) => {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD');
  },

  /**
   * Format datetime for backend API (yyyy-MM-dd HH:mm:ss format)
   * @param {Date|string|dayjs} date - Date to format
   * @returns {string} - Formatted datetime string
   */
  formatDateTimeForAPI: (date) => {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  },

  /**
   * Format date for display to users (human-readable)
   * @param {Date|string|dayjs} date - Date to format
   * @param {string} format - Custom format (default: 'MMM DD, YYYY')
   * @returns {string} - Formatted date string
   */
  formatForDisplay: (date, format = 'MMM DD, YYYY') => {
    if (!date) return '';
    return dayjs(date).format(format);
  },

  /**
   * Format date for form inputs (compatible with Ant Design DatePicker)
   * @param {Date|string|dayjs} date - Date to format
   * @returns {dayjs} - dayjs object for Ant Design components
   */
  formatForForm: (date) => {
    if (!date) return null;
    return dayjs(date);
  },

  /**
   * Get relative time (e.g., "2 hours ago", "in 3 days")
   * @param {Date|string|dayjs} date - Date to format
   * @returns {string} - Relative time string
   */
  getRelativeTime: (date) => {
    if (!date) return '';
    return dayjs(date).fromNow();
  },

  /**
   * Check if date is valid
   * @param {Date|string|dayjs} date - Date to validate
   * @returns {boolean} - True if valid date
   */
  isValid: (date) => {
    if (!date) return false;
    return dayjs(date).isValid();
  },

  /**
   * Get current date in API format
   * @returns {string} - Current date in yyyy-MM-dd format
   */
  getCurrentDateForAPI: () => {
    return dayjs().format('YYYY-MM-DD');
  },

  /**
   * Get current datetime in API format
   * @returns {string} - Current datetime in yyyy-MM-dd HH:mm:ss format
   */
  getCurrentDateTimeForAPI: () => {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  },

  /**
   * Parse date from various formats
   * @param {string} dateString - Date string to parse
   * @param {string} format - Expected format (optional)
   * @returns {dayjs} - dayjs object
   */
  parse: (dateString, format = null) => {
    if (!dateString) return null;
    return format ? dayjs(dateString, format) : dayjs(dateString);
  },

  /**
   * Add time to date
   * @param {Date|string|dayjs} date - Base date
   * @param {number} amount - Amount to add
   * @param {string} unit - Unit (day, month, year, hour, minute, etc.)
   * @returns {dayjs} - New date with added time
   */
  add: (date, amount, unit) => {
    if (!date) return null;
    return dayjs(date).add(amount, unit);
  },

  /**
   * Subtract time from date
   * @param {Date|string|dayjs} date - Base date
   * @param {number} amount - Amount to subtract
   * @param {string} unit - Unit (day, month, year, hour, minute, etc.)
   * @returns {dayjs} - New date with subtracted time
   */
  subtract: (date, amount, unit) => {
    if (!date) return null;
    return dayjs(date).subtract(amount, unit);
  },

  /**
   * Check if date is before another date
   * @param {Date|string|dayjs} date1 - First date
   * @param {Date|string|dayjs} date2 - Second date
   * @returns {boolean} - True if date1 is before date2
   */
  isBefore: (date1, date2) => {
    return dayjs(date1).isBefore(dayjs(date2));
  },

  /**
   * Check if date is after another date
   * @param {Date|string|dayjs} date1 - First date
   * @param {Date|string|dayjs} date2 - Second date
   * @returns {boolean} - True if date1 is after date2
   */
  isAfter: (date1, date2) => {
    return dayjs(date1).isAfter(dayjs(date2));
  },

  /**
   * Check if date is same as another date
   * @param {Date|string|dayjs} date1 - First date
   * @param {Date|string|dayjs} date2 - Second date
   * @param {string} unit - Unit to compare (day, month, year, etc.)
   * @returns {boolean} - True if dates are same
   */
  isSame: (date1, date2, unit = 'day') => {
    return dayjs(date1).isSame(dayjs(date2), unit);
  },

  /**
   * Get difference between two dates
   * @param {Date|string|dayjs} date1 - First date
   * @param {Date|string|dayjs} date2 - Second date
   * @param {string} unit - Unit for difference (day, month, year, etc.)
   * @returns {number} - Difference in specified unit
   */
  diff: (date1, date2, unit = 'day') => {
    return dayjs(date1).diff(dayjs(date2), unit);
  },

  /**
   * Get start of period (day, month, year, etc.)
   * @param {Date|string|dayjs} date - Date
   * @param {string} unit - Unit (day, month, year, etc.)
   * @returns {dayjs} - Start of period
   */
  startOf: (date, unit) => {
    return dayjs(date).startOf(unit);
  },

  /**
   * Get end of period (day, month, year, etc.)
   * @param {Date|string|dayjs} date - Date
   * @param {string} unit - Unit (day, month, year, etc.)
   * @returns {dayjs} - End of period
   */
  endOf: (date, unit) => {
    return dayjs(date).endOf(unit);
  },

  /**
   * Convert date to timezone
   * @param {Date|string|dayjs} date - Date to convert
   * @param {string} tz - Timezone (e.g., 'America/New_York')
   * @returns {dayjs} - Date in specified timezone
   */
  toTimezone: (date, tz) => {
    return dayjs(date).tz(tz);
  },

  /**
   * Get user's local timezone
   * @returns {string} - User's timezone
   */
  getUserTimezone: () => {
    return dayjs.tz.guess();
  },

  /**
   * Common date formats for easy access
   */
  formats: {
    API_DATE: 'YYYY-MM-DD',
    API_DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY_DATE: 'MMM DD, YYYY',
    DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
    DISPLAY_TIME: 'HH:mm',
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    SHORT_DATE: 'MM/DD/YYYY',
    LONG_DATE: 'dddd, MMMM DD, YYYY',
  }
};

export default dateHelper;
