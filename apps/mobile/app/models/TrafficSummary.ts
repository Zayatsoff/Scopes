import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatRelativeTime } from "@/utils/formatRelativeTime"
import { Api } from "@/services/api"

// Define interface for the API response
interface SummariesResponse {
  summaries: {
    id: string
    section: string
    date: string
    summary: string
    generatedAt: {
      _seconds: number
      _nanoseconds: number
    }
  }[]
}

/**
 * Traffic summary item model
 */
export const TrafficSummaryItemModel = types
  .model("TrafficSummaryItem")
  .props({
    id: types.identifier,
    section: types.string,
    date: types.string,
    summary: types.string,
    generatedAt: types.frozen(),
    formattedDate: types.optional(types.string, ""),
  })
  .actions(withSetPropAction)

export interface TrafficSummaryItem extends Instance<typeof TrafficSummaryItemModel> {}
export interface TrafficSummaryItemSnapshotOut extends SnapshotOut<typeof TrafficSummaryItemModel> {}
export interface TrafficSummaryItemSnapshotIn extends SnapshotIn<typeof TrafficSummaryItemModel> {}

/**
 * Traffic summaries store model
 */
export const TrafficSummaryStoreModel = types
  .model("TrafficSummaryStore")
  .props({
    items: types.array(TrafficSummaryItemModel),
    isLoading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get latestSummary() {
      if (self.items.length === 0) return null
      // Find item with section = "Traffic"
      const trafficItems = self.items.filter(item => item.section === "Traffic")
      return trafficItems.length > 0 ? trafficItems[0] : null
    },
  }))
  .actions((self) => ({
    fetchTrafficSummaries: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        // Call the getSummaries endpoint
        const response = await api.apisauce.get<SummariesResponse>("https://local-government-app-backend.vercel.app/api/getSummaries")
        
        if (response.ok && response.data) {
          const summaries = response.data.summaries || []
          // Process the summaries data to add formatted dates
          const processedItems = summaries
            .filter(item => item.section === "Traffic") // Filter traffic summaries only
            .map((item) => ({
              ...item,
              formattedDate: formatRelativeTime(item.date),
            }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to fetch traffic summaries")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
    },
    
    refreshTrafficSummaries: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.apisauce.get<SummariesResponse>("https://local-government-app-backend.vercel.app/api/getSummaries")
        
        if (response.ok && response.data) {
          const summaries = response.data.summaries || []
          // Process the summaries data to add formatted dates
          const processedItems = summaries
            .filter(item => item.section === "Traffic") // Filter traffic summaries only
            .map((item) => ({
              ...item,
              formattedDate: formatRelativeTime(item.date),
            }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to refresh traffic summaries")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
      
      return true // Return success indicator for the refresh control
    }
  }))

export interface TrafficSummaryStore extends Instance<typeof TrafficSummaryStoreModel> {}
export interface TrafficSummaryStoreSnapshotOut extends SnapshotOut<typeof TrafficSummaryStoreModel> {}
export interface TrafficSummaryStoreSnapshotIn extends SnapshotIn<typeof TrafficSummaryStoreModel> {} 