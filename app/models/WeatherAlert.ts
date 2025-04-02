import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
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
    type: types.optional(types.string, "weatherAlert"),
    scrapedAt: types.frozen(),
    formattedDate: types.optional(types.string, ""),
  })
  .actions(withSetPropAction)

export interface WeatherAlertItem extends Instance<typeof WeatherAlertItemModel> {}
export interface WeatherAlertItemSnapshotOut extends SnapshotOut<typeof WeatherAlertItemModel> {}
export interface WeatherAlertItemSnapshotIn extends SnapshotIn<typeof WeatherAlertItemModel> {}

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
  .views((self) => ({
    get sortedItems() {
      return [...self.items].sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime()
        const dateB = new Date(b.pubDate).getTime()
        return self.sortNewestFirst ? dateB - dateA : dateA - dateB
      })
    },
    get latestAlert() {
      if (self.items.length === 0) return null
      return self.sortedItems[0]
    }
  }))
  .actions((self) => ({
    toggleSortOrder: () => {
      self.setProp("sortNewestFirst", !self.sortNewestFirst)
    },
    
    fetchWeatherAlerts: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.weatherAlerts.getWeatherAlerts()
        
        if (response.ok && response.data?.weatherAlerts) {
          console.log("Raw weather alerts:", response.data.weatherAlerts.length)
          
          // Process the weather alerts data to add formatted dates
          const processedItems = response.data.weatherAlerts.map((item: any) => {
            return {
              ...item,
              formattedDate: formatRelativeTime(item.pubDate),
            }
          })
          
          console.log("Processed weather alerts:", processedItems.length)
          self.setProp("items", processedItems)
        } else {
          console.error("Failed to fetch weather alerts:", response.problem, response.status)
          self.setProp("error", "Failed to fetch weather alerts")
        }
      } catch (error) {
        console.error("Weather alerts fetch error:", error)
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
    },
    
    refreshWeatherAlerts: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.weatherAlerts.getWeatherAlerts()
        
        if (response.ok && response.data?.weatherAlerts) {
          // Process the weather alerts data to add formatted dates
          const processedItems = response.data.weatherAlerts.map((item: any) => ({
            ...item,
            formattedDate: formatRelativeTime(item.pubDate),
          }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to refresh weather alerts")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
      
      return true // Return success indicator for the refresh control
    }
  }))

export interface WeatherAlertStore extends Instance<typeof WeatherAlertStoreModel> {}
export interface WeatherAlertStoreSnapshotOut extends SnapshotOut<typeof WeatherAlertStoreModel> {}
export interface WeatherAlertStoreSnapshotIn extends SnapshotIn<typeof WeatherAlertStoreModel> {} 