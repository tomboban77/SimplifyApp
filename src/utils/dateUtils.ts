import { format, isValid, parseISO } from 'date-fns';

/**
 * Safely format a date string, returning a fallback if invalid
 */
export function formatDateSafe(dateString: string | undefined | null, formatStr: string = 'MMM d, yyyy'): string {
  if (!dateString) {
    return 'Unknown date';
  }

  try {
    let date: Date;
    
    // Handle different date formats
    if (typeof dateString === 'string') {
      // Handle Firebase Timestamp format (if it's an object stringified)
      if (dateString.startsWith('{') || dateString.includes('seconds')) {
        // This might be a Firebase Timestamp object stringified
        try {
          const parsed = JSON.parse(dateString);
          if (parsed.seconds) {
            date = new Date(parsed.seconds * 1000);
          } else {
            date = new Date(dateString);
          }
        } catch {
          date = new Date(dateString);
        }
      } else if (dateString.includes('T') || dateString.includes('Z')) {
        // ISO string format
        date = parseISO(dateString);
      } else {
        // Try standard date parsing
        date = new Date(dateString);
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      // Fallback
      date = new Date(dateString);
    }

    // Check if date is valid
    if (!isValid(date) || isNaN(date.getTime())) {
      // Try one more time with current date as fallback
      const now = new Date();
      if (isValid(now)) {
        return format(now, formatStr);
      }
      return 'Invalid date';
    }

    return format(date, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    // Return current date as fallback
    try {
      return format(new Date(), formatStr);
    } catch {
      return 'Invalid date';
    }
  }
}

