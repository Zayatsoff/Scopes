import {
  parseISO,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  format,
} from "date-fns"

/**
 * Formats a date string as relative time (e.g., "5 min ago", "3 hours ago", "2 days ago")
 * If the date is older than 6 days, returns the formatted date instead
 *
 * @param dateString ISO date string to format
 * @returns A string representing the relative time or formatted date
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    const now = new Date()

    // Calculate time differences
    const minutesDiff = differenceInMinutes(now, date)
    const hoursDiff = differenceInHours(now, date)
    const daysDiff = differenceInDays(now, date)

    // Format based on time difference
    if (minutesDiff < 60) {
      // Less than an hour ago
      return `${minutesDiff} min ago`
    } else if (hoursDiff < 24) {
      // Less than a day ago
      return `${hoursDiff} hour${hoursDiff === 1 ? "" : "s"} ago`
    } else if (daysDiff <= 6) {
      // Less than or equal to 6 days ago
      return `${daysDiff} day${daysDiff === 1 ? "" : "s"} ago`
    } else {
      // More than 6 days ago, use formatted date
      return format(date, "MMM dd, yyyy")
    }
  } catch (error) {
    console.error("Error formatting relative time:", error)
    return dateString // Return the original string if there's an error
  }
}
