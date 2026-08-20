import { AlertItem } from "@/components/AlertCard"
import { formatRelativeTime } from "@/utils/formatRelativeTime"
import { AlertCategory } from "@/utils/alertCategoryUtils"

interface SourceMap {
  [key: string]: string
}

/**
 * Sources for each alert category
 */
const ALERT_SOURCES: SourceMap = {
  weather: "Environment Canada",
  police: "Ottawa Police Service",
  hydro: "Hydro Ottawa",
  traffic: "City of Ottawa Traffic",
}

/**
 * Generate mock alerts for a specific category
 *
 * @param category The category to generate alerts for
 * @param count Number of alerts to generate (default: 10)
 * @returns Array of mock alerts
 */
export function generateMockAlerts(category: AlertCategory, count = 10): AlertItem[] {
  return Array.from({ length: count }, (_, i) => {
    // Generate a date in ISO format for i hours ago
    const date = new Date(Date.now() - i * 3600000).toISOString()
    const formattedDate = new Date(Date.now() - i * 3600000).toLocaleDateString()

    return {
      id: `${category}-${i}`,
      source: ALERT_SOURCES[category] || "Unknown Source",
      message: `This is a mock ${category} alert #${i + 1} for testing.`,
      timestamp: formatRelativeTime(date),
      category,
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Alert #${i + 1}`,
      excerpt: `Detailed information about this ${category} alert situation. This provides additional context for the alert message.`,
      link: `https://example.com/${category}/alert/${i}`,
      date,
      formattedDate,
    }
  })
}
