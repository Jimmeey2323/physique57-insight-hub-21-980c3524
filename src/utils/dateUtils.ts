
/**
 * Generate dynamic months from current month backwards
 * @param numberOfMonths Number of months to generate (default: 18)
 * @returns Array of month objects with key, display, year, month, and quarter
 */
export const generateDynamicMonths = (numberOfMonths: number = 18) => {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Get current date for dynamic month calculation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Generate months starting from current month and going backwards
  let year = currentYear;
  let month = currentMonth;
  
  for (let i = 0; i < numberOfMonths; i++) {
    const monthName = monthNames[month];
    
    months.push({
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      display: `${monthName} ${year}`,
      year: year,
      month: month + 1,
      quarter: Math.ceil((month + 1) / 3)
    });
    
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
  }
  
  return months;
};

/**
 * Parse date string in DD/MM/YYYY format
 * @param dateStr Date string to parse
 * @returns Date object or null if invalid
 */
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  // Handle DD/MM/YYYY format
  const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Handle other common date formats
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Get the current month key in YYYY-MM format
 */
export const getCurrentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Check if a month key is in the current year
 */
export const isCurrentYear = (monthKey: string): boolean => {
  const currentYear = new Date().getFullYear();
  return monthKey.startsWith(currentYear.toString());
};
