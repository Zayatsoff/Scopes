import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatRelativeTime } from "@/utils/formatRelativeTime"
import { Api } from "@/services/api"

/**
 * Traffic alert item model
 */
export const TrafficAlertItemModel = types
  .model("TrafficAlertItem")
  .props({
    id: types.identifier,
    headline: types.string,
    message: types.string,
    eventType: types.string,
    created: types.string,
    updated: types.optional(types.string, ""),
    status: types.optional(types.string, "ACTIVE"),
    improvedHeadline: types.string,
    formattedDate: types.optional(types.string, ""),
    generation_source: types.optional(types.string, ""),
    cause: types.optional(types.string, ""),
    priority: types.optional(types.string, ""),
    geodata: types.optional(
      types.model({
        coordinates: types.optional(types.string, ""),
        type: types.optional(types.string, "")
      }),
      {}
    ),
    schedule: types.optional(
      types.array(
        types.model({
          startDateTime: types.optional(types.string, ""),
          endDateTime: types.optional(types.string, "")
        })
      ),
      []
    )
  })
  .actions(withSetPropAction)

export interface TrafficAlertItem extends Instance<typeof TrafficAlertItemModel> {}
export interface TrafficAlertItemSnapshotOut extends SnapshotOut<typeof TrafficAlertItemModel> {}
export interface TrafficAlertItemSnapshotIn extends SnapshotIn<typeof TrafficAlertItemModel> {}

/**
 * Traffic alerts store model
 */
export const TrafficAlertsStoreModel = types
  .model("TrafficAlertsStore")
  .props({
    items: types.array(TrafficAlertItemModel),
    isLoading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
    sortNewestFirst: types.optional(types.boolean, true), // Default newest first
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get sortedItems() {
      return [...self.items].sort((a, b) => {
        const dateA = new Date(a.created).getTime()
        const dateB = new Date(b.created).getTime()
        return self.sortNewestFirst ? dateB - dateA : dateA - dateB
      })
    },
  }))
  .actions((self) => ({
    toggleSortOrder: () => {
      self.setProp("sortNewestFirst", !self.sortNewestFirst)
    },
    
    fetchTrafficAlerts: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.trafficAlerts.getTrafficAlerts()
        
        if (response.ok && response.data?.trafficAlerts?.events) {
          // Process the traffic alerts data to add formatted dates and convert numeric IDs to strings
          const processedItems = response.data.trafficAlerts.events.map((item: any) => ({
            ...item,
            // Convert numeric ID to string for MST identifier type
            id: String(item.id),
            // Convert coordinates to string if it's an object
            geodata: {
              ...item.geodata,
              coordinates: typeof item.geodata?.coordinates === 'string' 
                ? item.geodata.coordinates 
                : JSON.stringify(item.geodata?.coordinates)
            },
            formattedDate: formatRelativeTime(item.created),
          }))
          
          self.setProp("items", processedItems)
        } else {
          console.error("Failed to fetch traffic alerts:", response.problem, response.status)
          self.setProp("error", "Failed to fetch traffic alerts")
        }
      } catch (error) {
        console.error("Traffic alerts fetch error:", error)
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
    },
    
    refreshTrafficAlerts: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.trafficAlerts.getTrafficAlerts()
        
        if (response.ok && response.data?.trafficAlerts?.events) {
          // Process the traffic alerts data to add formatted dates and convert numeric IDs to strings
          const processedItems = response.data.trafficAlerts.events.map((item: any) => ({
            ...item,
            // Convert numeric ID to string for MST identifier type
            id: String(item.id),
            // Convert coordinates to string if it's an object
            geodata: {
              ...item.geodata,
              coordinates: typeof item.geodata?.coordinates === 'string' 
                ? item.geodata.coordinates 
                : JSON.stringify(item.geodata?.coordinates)
            },
            formattedDate: formatRelativeTime(item.created),
          }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to refresh traffic alerts")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
      
      return true // Return success indicator for the refresh control
    }
  }))

export interface TrafficAlertsStore extends Instance<typeof TrafficAlertsStoreModel> {}
export interface TrafficAlertsStoreSnapshotOut extends SnapshotOut<typeof TrafficAlertsStoreModel> {}
export interface TrafficAlertsStoreSnapshotIn extends SnapshotIn<typeof TrafficAlertsStoreModel> {} 