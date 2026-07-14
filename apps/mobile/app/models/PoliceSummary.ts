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
 * Police summary item model
 */
export const PoliceSummaryItemModel = types
  .model("PoliceSummaryItem")
  .props({
    id: types.identifier,
    section: types.string,
    date: types.string,
    summary: types.string,
    generatedAt: types.frozen(), // Complex object with _seconds and _nanoseconds
    formattedDate: types.optional(types.string, ""),
  })
  .actions(withSetPropAction)

export interface PoliceSummaryItem extends Instance<typeof PoliceSummaryItemModel> {}
export interface PoliceSummaryItemSnapshotOut extends SnapshotOut<typeof PoliceSummaryItemModel> {}
export interface PoliceSummaryItemSnapshotIn extends SnapshotIn<typeof PoliceSummaryItemModel> {}

/**
 * Police summaries store model
 */
export const PoliceSummaryStoreModel = types
  .model("PoliceSummaryStore")
  .props({
    items: types.array(PoliceSummaryItemModel),
    isLoading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get latestSummary() {
      if (self.items.length === 0) return null
      // Find item with section = "Police"
      const policeItems = self.items.filter(item => item.section === "Police")
      return policeItems.length > 0 ? policeItems[0] : null
    },
  }))
  .actions((self) => ({
    fetchPoliceSummaries: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        // Call the getSummaries endpoint
        const response = await api.apisauce.get<SummariesResponse>("https://local-government-app-backend.vercel.app/api/getSummaries")
        
        if (response.ok && response.data) {
          const summaries = response.data.summaries || []
          // Process the summaries data to add formatted dates
          const processedItems = summaries
            .filter(item => item.section === "Police") // Filter police summaries only
            .map((item) => ({
              ...item,
              formattedDate: formatRelativeTime(item.date),
            }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to fetch police summaries")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
    },
    
    refreshPoliceSummaries: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.apisauce.get<SummariesResponse>("https://local-government-app-backend.vercel.app/api/getSummaries")
        
        if (response.ok && response.data) {
          const summaries = response.data.summaries || []
          // Process the summaries data to add formatted dates
          const processedItems = summaries
            .filter(item => item.section === "Police") // Filter police summaries only
            .map((item) => ({
              ...item,
              formattedDate: formatRelativeTime(item.date),
            }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to refresh police summaries")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
      
      return true // Return success indicator for the refresh control
    }
  }))

export interface PoliceSummaryStore extends Instance<typeof PoliceSummaryStoreModel> {}
export interface PoliceSummaryStoreSnapshotOut extends SnapshotOut<typeof PoliceSummaryStoreModel> {}
export interface PoliceSummaryStoreSnapshotIn extends SnapshotIn<typeof PoliceSummaryStoreModel> {} 