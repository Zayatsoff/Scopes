import { Flame, Car, Snowflake, Bus, MapPin, CircleAlert } from "lucide-react-native"
import type { ComponentType } from "react"
import type { ColorValue } from "react-native"
import { logError } from "@/utils/errorLogger"
import type { StatusItem } from "./types"

// lucide-react-native doesn't export its own prop types, so this is the
// narrow shape CityStatus actually renders each icon with
type StatusIconComponent = ComponentType<{ size?: string | number; color?: ColorValue }>

// single source of truth for how a status title maps to an icon + label.
// ottawa.ca's indicator set is seasonal (2 in summer, 5+ in winter), so this
// list is matched top-to-bottom; anything unrecognized falls through to the
// default icon in getStatusType instead of being dropped or mislabeled.
//
// known titles come from the scraper's own extraction prompt
// (services/api/scripts/scrape-ottawa.ts): Rink of Dreams, Jim Tubman
// Chevrolet Rink, Lansdowne Park skating court, Ben Franklin Place Skating
// Rink, Sledding, winter weather parking, Open air fires -> live site (July
// 2026) only surfaces the fire status, confirming the set really is seasonal
interface StatusType {
  icon: StatusIconComponent
  // omit to keep the item's own title as the label (multiple rinks are
  // distinct venues, so a single one shouldn't get a generic caption)
  label?: string
  match: (titleLower: string) => boolean
  // items that share a groupKey collapse into one icon (with a disclosure
  // badge) once there's more than one of them -> ottawa.ca lists each rink
  // as its own status, and 4 separate rink icons would overrun the row
  groupKey?: string
  groupLabel?: string
}

export const STATUS_TYPES: StatusType[] = [
  { icon: Flame, label: "Fire Ban", match: (t) => t.includes("fire") },
  { icon: Car, label: "Parking", match: (t) => t.includes("parking") },
  { icon: Snowflake, label: "Sledding", match: (t) => t.includes("sledding") },
  {
    icon: MapPin,
    match: (t) => t.includes("skating") || t.includes("rink"),
    groupKey: "skating",
    groupLabel: "Skating",
  },
  { icon: Bus, label: "School Bus", match: (t) => t.includes("school bus") },
]

const DEFAULT_ICON: StatusIconComponent = CircleAlert

// dedupe so an unrecognized title logs once per app session, not once per render
const reportedUnknownTitles = new Set<string>()

function reportUnknownStatusType(title: string) {
  if (reportedUnknownTitles.has(title)) return
  reportedUnknownTitles.add(title)
  logError(new Error(`CityStatus: unrecognized status title "${title}"`), {
    componentName: "CityStatus",
    severity: "low",
    tags: ["city-status", "unmapped-indicator"],
    additionalInfo: { title },
  })
}

function matchStatusType(title: string): StatusType | undefined {
  const titleLower = title.toLowerCase()
  const match = STATUS_TYPES.find((type) => type.match(titleLower))
  if (!match) {
    reportUnknownStatusType(title)
  }
  return match
}

export function getStatusType(title: string): { icon: StatusIconComponent; label: string } {
  const match = matchStatusType(title)
  return { icon: match?.icon ?? DEFAULT_ICON, label: match?.label ?? title }
}

// one row entry: either a single status item, or several sharing a groupKey
// collapsed behind one icon (expandItems.length > 1 signals the badge + list)
export interface StatusRenderEntry {
  id: string
  icon: StatusIconComponent
  label: string
  active: boolean
  accessibilityLabel: string
  expandItems: StatusItem[]
}

function bucketKeyFor(item: StatusItem): string {
  const groupKey = matchStatusType(item.title)?.groupKey
  return groupKey ? `group:${groupKey}` : `item:${item.id}`
}

function toEntry(bucketKey: string, items: StatusItem[]): StatusRenderEntry {
  if (items.length === 1) {
    const item = items[0]
    const { icon, label } = getStatusType(item.title)
    return {
      id: item.id,
      icon,
      label,
      active: item.bool,
      accessibilityLabel: `${item.title}: ${item.bool ? "active" : "inactive"}`,
      expandItems: items,
    }
  }

  const groupKey = bucketKey.slice("group:".length)
  const type = STATUS_TYPES.find((t) => t.groupKey === groupKey)
  const activeCount = items.filter((item) => item.bool).length
  const label = type?.groupLabel ?? type?.label ?? "Status"

  return {
    id: bucketKey,
    icon: type?.icon ?? DEFAULT_ICON,
    label,
    active: activeCount > 0,
    accessibilityLabel: `${label}: ${activeCount} of ${items.length} active`,
    expandItems: items,
  }
}

// groups statusItems into render entries, preserving each bucket's first
// appearance order so the row's layout doesn't jump around as items load
export function groupStatusItems(statusItems: StatusItem[]): StatusRenderEntry[] {
  const buckets = new Map<string, StatusItem[]>()
  for (const item of statusItems) {
    const key = bucketKeyFor(item)
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.push(item)
    } else {
      buckets.set(key, [item])
    }
  }

  const seen = new Set<string>()
  const entries: StatusRenderEntry[] = []
  for (const item of statusItems) {
    const key = bucketKeyFor(item)
    if (seen.has(key)) continue
    seen.add(key)
    entries.push(toEntry(key, buckets.get(key)!))
  }
  return entries
}
