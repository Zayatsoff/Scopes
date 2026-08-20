import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import type { AssertExtends, WeatherAlertDTO } from "@scopes/shared-types"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatRelativeTime } from "@/utils/formatRelativeTime"
import { Api } from "@/services/api"

/**
 * Weather alert item model
 */
export const WeatherAlertItemModel = types
  .model("WeatherAlertItem")
  .props({
    id: types.identifier,
    title: types.string,
    link: types.string,
    pubDate: types.string,
    isoDate: types.optional(types.string, ""),
    summary: types.optional(types.string, ""),
    locationsAffected: types.optional(types.array(types.string), []),
    effectiveTime: types.optional(types.string, ""),
    alertTime: types.optional(types.string, ""),
    type: types.optional(types.enumeration(["weatherAlert"] as const), "weatherAlert"),
    scrapedAt: types.frozen(),
    formattedDate: types.optional(types.string, ""),
  })
  .actions(withSetPropAction)

export interface WeatherAlertItem extends Instance<typeof WeatherAlertItemModel> {}
export interface WeatherAlertItemSnapshotOut extends SnapshotOut<typeof WeatherAlertItemModel> {}
export interface WeatherAlertItemSnapshotIn extends SnapshotIn<typeof WeatherAlertItemModel> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _WeatherAlertItemDriftCheck = AssertExtends<WeatherAlertItemSnapshotOut, WeatherAlertDTO>

/**
 * Weather alerts store model
 */
export const WeatherAlertStoreModel = types
  .model("WeatherAlertStore")
  .props({
    items: types.array(WeatherAlertItemModel),
    isLoading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
    sortNewestFirst: types.optional(types.boolean, true), // Default newest first
  })
  .actions(withSetPropAction)
  .views((store) => ({
    get sortedItems() {
      return [...store.items].sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime()
        const dateB = new Date(b.pubDate).getTime()
        return store.sortNewestFirst ? dateB - dateA : dateA - dateB
      })
    },
    get latestAlert() {
      if (store.items.length === 0) return null

      // Sort manually instead of using sortedItems to avoid TS error
      const sorted = [...store.items].sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime()
        const dateB = new Date(b.pubDate).getTime()
        return store.sortNewestFirst ? dateB - dateA : dateA - dateB
      })

      return sorted[0]
    },
  }))
  .actions((store) => {
    // Define actions that don't depend on other actions
    const clearItems = () => {
      store.setProp("items", [])
    }

    const toggleSortOrder = () => {
      store.setProp("sortNewestFirst", !store.sortNewestFirst)
    }

    // Return the actions to make them available
    return {
      clearItems,
      toggleSortOrder,
    }
  })
  .actions((store) => {
    // Define actions that depend on the previously defined actions
    const fetchWeatherAlerts = async (api: Api) => {
      store.setProp("isLoading", true)
      store.setProp("error", null)

      try {
        const response = await api.weatherAlerts.getWeatherAlerts()

        if (response.ok && response.data?.weatherAlerts) {
          console.log("Raw weather alerts:", response.data.weatherAlerts.length)

          // Clear old cached items before setting new ones
          store.clearItems()

          // Process the weather alerts data to add formatted dates
          const processedItems = response.data.weatherAlerts.map((item: any) => {
            // Validate the data structure
            if (!item.id || !item.title || !item.pubDate) {
              console.warn("Weather alert is missing required fields:", JSON.stringify(item))
            }

            // Handle scrapedAt field properly regardless of format
            if (
              item.scrapedAt &&
              typeof item.scrapedAt === "object" &&
              "_seconds" in item.scrapedAt
            ) {
              // No need to modify, MST's frozen type will handle this
              console.log("Found Firestore timestamp format for scrapedAt")
            }

            return {
              ...item,
              // Ensure these fields exist with proper defaults
              summary: item.summary || "",
              locationsAffected: Array.isArray(item.locationsAffected)
                ? item.locationsAffected
                : [],
              effectiveTime: item.effectiveTime || "",
              alertTime: item.alertTime || "",
              type: item.type || "weatherAlert",
              formattedDate: formatRelativeTime(item.pubDate),
            }
          })

          console.log("Processed weather alerts:", processedItems.length)
          console.log("First processed alert:", JSON.stringify(processedItems[0]))
          store.setProp("items", processedItems)
        } else {
          console.error("Failed to fetch weather alerts:", response.problem, response.status)
          store.setProp("error", "Failed to fetch weather alerts")
        }
      } catch (error) {
        console.error("Weather alerts fetch error:", error)
        store.setProp("error", String(error))
      } finally {
        store.setProp("isLoading", false)
      }
    }

    const refreshWeatherAlerts = async (api: Api) => {
      store.setProp("isLoading", true)
      store.setProp("error", null)

      try {
        const response = await api.weatherAlerts.getWeatherAlerts()

        if (response.ok && response.data?.weatherAlerts) {
          // Clear old cached items before setting new ones
          store.clearItems()

          // Process the weather alerts data to add formatted dates
          const processedItems = response.data.weatherAlerts.map((item: any) => {
            // Validate the data structure
            if (!item.id || !item.title || !item.pubDate) {
              console.warn("Weather alert is missing required fields:", JSON.stringify(item))
            }

            // Handle scrapedAt field properly regardless of format
            if (
              item.scrapedAt &&
              typeof item.scrapedAt === "object" &&
              "_seconds" in item.scrapedAt
            ) {
              // No need to modify, MST's frozen type will handle this
              console.log("Found Firestore timestamp format for scrapedAt")
            }

            return {
              ...item,
              // Ensure these fields exist with proper defaults
              summary: item.summary || "",
              locationsAffected: Array.isArray(item.locationsAffected)
                ? item.locationsAffected
                : [],
              effectiveTime: item.effectiveTime || "",
              alertTime: item.alertTime || "",
              type: item.type || "weatherAlert",
              formattedDate: formatRelativeTime(item.pubDate),
            }
          })

          console.log("Refreshed weather alerts:", processedItems.length)
          console.log("First refreshed alert:", JSON.stringify(processedItems[0]))
          store.setProp("items", processedItems)
        } else {
          store.setProp("error", "Failed to refresh weather alerts")
        }
      } catch (error) {
        store.setProp("error", String(error))
      } finally {
        store.setProp("isLoading", false)
      }

      return true // Return success indicator for the refresh control
    }

    // Return the actions to make them available
    return {
      fetchWeatherAlerts,
      refreshWeatherAlerts,
    }
  })

export interface WeatherAlertStore extends Instance<typeof WeatherAlertStoreModel> {}
export interface WeatherAlertStoreSnapshotOut extends SnapshotOut<typeof WeatherAlertStoreModel> {}
export interface WeatherAlertStoreSnapshotIn extends SnapshotIn<typeof WeatherAlertStoreModel> {}
