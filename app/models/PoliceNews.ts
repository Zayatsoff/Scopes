import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatDate } from "@/utils/formatDate"
import { formatRelativeTime } from "@/utils/formatRelativeTime"
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
  .views((store) => ({
    get sortedItems() {
      return [...store.items].sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return store.sortNewestFirst ? dateB - dateA : dateA - dateB
      })
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
    const fetchPoliceNews = async (api: Api) => {
      store.setProp("isLoading", true)
      store.setProp("error", null)
      
      try {
        const response = await api.policeNews.getPoliceNews()
        console.log("Police news API response:", response)
        
        if (response.ok && response.data?.policeNews) {
          console.log("Raw police news items:", response.data.policeNews.length)
          
          // Clear old cached items before setting new ones
          store.clearItems()
          
          // Process the police news data to add formatted dates
          const processedItems = response.data.policeNews.map((item: any) => {
            console.log("Processing item:", item.id, item.title)
            return {
              ...item,
              formattedDate: formatRelativeTime(item.date),
            }
          })
          
          console.log("Processed police news items:", processedItems.length)
          store.setProp("items", processedItems)
        } else {
          console.error("Failed to fetch police news:", response.problem, response.status)
          store.setProp("error", "Failed to fetch police news")
        }
      } catch (error) {
        console.error("Police news fetch error:", error)
        store.setProp("error", String(error))
      } finally {
        store.setProp("isLoading", false)
      }
    }
    
    const refreshPoliceNews = async (api: Api) => {
      store.setProp("isLoading", true)
      store.setProp("error", null)
      
      try {
        const response = await api.policeNews.getPoliceNews()
        
        if (response.ok && response.data?.policeNews) {
          // Clear old cached items before setting new ones
          store.clearItems()
          
          // Process the police news data to add formatted dates
          const processedItems = response.data.policeNews.map((item: any) => ({
            ...item,
            formattedDate: formatRelativeTime(item.date),
          }))
          
          store.setProp("items", processedItems)
        } else {
          store.setProp("error", "Failed to refresh police news")
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
      fetchPoliceNews,
      refreshPoliceNews,
    }
  })

export interface PoliceNewsStore extends Instance<typeof PoliceNewsStoreModel> {}
export interface PoliceNewsStoreSnapshotOut extends SnapshotOut<typeof PoliceNewsStoreModel> {}
export interface PoliceNewsStoreSnapshotIn extends SnapshotIn<typeof PoliceNewsStoreModel> {} 