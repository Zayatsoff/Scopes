import { CloudSun, Siren, Zap, BusFront } from "lucide-react-native"
import type { LucideIcon } from "lucide-react-native"

export type AlertCategory = "weather" | "police" | "hydro" | "traffic"

export interface CategoryInfo {
  id: AlertCategory
  label: string
  color: string
  icon: LucideIcon
  source: string
}

/**
 * Get all alert categories with their metadata
 */
export function getAlertCategories(themeColors: Record<AlertCategory, string>): CategoryInfo[] {
  return [
    {
      id: "weather",
      label: "Weather",
      color: themeColors.weather,
      icon: CloudSun,
      source: "Environment Canada",
    },
    {
      id: "police",
      label: "Police",
      color: themeColors.police,
      icon: Siren,
      source: "Ottawa Police Service",
    },
    {
      id: "hydro",
      label: "Hydro",
      color: themeColors.hydro,
      icon: Zap,
      source: "Hydro Ottawa",
    },
    {
      id: "traffic",
      label: "Road & Traffic",
      color: themeColors.traffic,
      icon: BusFront,
      source: "City of Ottawa Traffic",
    },
  ]
}

/**
 * Get category info for a specific category ID
 */
export function getCategoryInfo(
  categoryId: AlertCategory,
  themeColors: Record<AlertCategory, string>,
): CategoryInfo {
  return (
    getAlertCategories(themeColors).find((c) => c.id === categoryId) ||
    getAlertCategories(themeColors)[0]
  )
}

/**
 * Generate a consistent identifier for alert category tabs
 */
export function getCategoryTabKey(category: AlertCategory): string {
  return `${category}-tab`
}

/**
 * Convert any string to a valid alert category, defaulting to "weather" if invalid
 */
export function parseAlertCategory(value: string): AlertCategory {
  return ["weather", "police", "hydro", "traffic"].includes(value)
    ? (value as AlertCategory)
    : "weather"
}
