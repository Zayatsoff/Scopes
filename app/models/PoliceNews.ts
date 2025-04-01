import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatDate } from "@/utils/formatDate"
import { Api } from "@/services/api"

/**
 * Police news item model
 */
export const PoliceNewsItemModel = types
  .model("PoliceNewsItem")
  .props({
    id: types.identifier,
    title: types.string,
    link: types.string,
    date: types.string,
    categories: types.optional(types.array(types.string), []),
    excerpt: types.optional(types.string, ""),
    formattedDate: types.optional(types.string, ""),
  })
  .actions(withSetPropAction)

export interface PoliceNewsItem extends Instance<typeof PoliceNewsItemModel> {}
export interface PoliceNewsItemSnapshotOut extends SnapshotOut<typeof PoliceNewsItemModel> {}
export interface PoliceNewsItemSnapshotIn extends SnapshotIn<typeof PoliceNewsItemModel> {}

/**
 * Police news store model
 */
export const PoliceNewsStoreModel = types
  .model("PoliceNewsStore")
  .props({
    items: types.array(PoliceNewsItemModel),
    isLoading: types.optional(types.boolean, false),
    error: types.maybeNull(types.string),
    sortNewestFirst: types.optional(types.boolean, true), // Default newest first
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get sortedItems() {
      return [...self.items].sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return self.sortNewestFirst ? dateB - dateA : dateA - dateB
      })
    },
  }))
  .actions((self) => ({
    toggleSortOrder: () => {
      self.setProp("sortNewestFirst", !self.sortNewestFirst)
    },
    
    fetchPoliceNews: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.policeNews.getPoliceNews()
        console.log("Police news API response:", response)
        
        if (response.ok && response.data?.policeNews) {
          console.log("Raw police news items:", response.data.policeNews.length)
          
          // Process the police news data to add formatted dates
          const processedItems = response.data.policeNews.map((item: any) => {
            console.log("Processing item:", item.id, item.title)
            return {
              ...item,
              formattedDate: formatDate(item.date),
            }
          })
          
          console.log("Processed police news items:", processedItems.length)
          self.setProp("items", processedItems)
        } else {
          console.error("Failed to fetch police news:", response.problem, response.status)
          self.setProp("error", "Failed to fetch police news")
        }
      } catch (error) {
        console.error("Police news fetch error:", error)
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
    },
    
    refreshPoliceNews: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.policeNews.getPoliceNews()
        
        if (response.ok && response.data?.policeNews) {
          // Process the police news data to add formatted dates
          const processedItems = response.data.policeNews.map((item: any) => ({
            ...item,
            formattedDate: formatDate(item.date),
          }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to refresh police news")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
      
      return true // Return success indicator for the refresh control
    }
  }))

export interface PoliceNewsStore extends Instance<typeof PoliceNewsStoreModel> {}
export interface PoliceNewsStoreSnapshotOut extends SnapshotOut<typeof PoliceNewsStoreModel> {}
export interface PoliceNewsStoreSnapshotIn extends SnapshotIn<typeof PoliceNewsStoreModel> {} 