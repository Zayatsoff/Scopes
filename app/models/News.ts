import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatDate } from "@/utils/formatDate"
import { Api } from "@/services/api"

/**
 * News item model
 */
export const NewsItemModel = types
  .model("NewsItem")
  .props({
    id: types.identifier,
    title: types.string,
    description: types.optional(types.string, ""),
    link: types.string,
    date: types.string,
    source: types.string,
    authors: types.optional(types.string, ""),
    formattedDate: types.optional(types.string, ""),
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get sourceDisplay() {
      // Clean up source display (e.g., www.cbc.ca -> CBC)
      const domain = self.source.replace(/^www\./i, "")
      return domain.split(".")[0].toUpperCase()
    },
  }))

export interface NewsItem extends Instance<typeof NewsItemModel> {}
export interface NewsItemSnapshotOut extends SnapshotOut<typeof NewsItemModel> {}
export interface NewsItemSnapshotIn extends SnapshotIn<typeof NewsItemModel> {}

/**
 * News store model
 */
export const NewsStoreModel = types
  .model("NewsStore")
  .props({
    items: types.array(NewsItemModel),
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
    
    get latestItems() {
      // Use the same sorting logic directly instead of referencing sortedItems
      return [...self.items]
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return self.sortNewestFirst ? dateB - dateA : dateA - dateB
        })
        .slice(0, 20) // Get latest 20 items for home screen
    }
  }))
  .actions((self) => ({
    toggleSortOrder() {
      self.setProp("sortNewestFirst", !self.sortNewestFirst)
    },
    
    fetchNews: async (api: Api) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.news.getNews()
        
        if (response.ok && response.data?.news) {
          // Process the news data to add formatted dates and ensure IDs
          const processedItems = response.data.news.map((item: any) => ({
            ...item,
            id: item.id || item.link, // Use link as fallback ID if none provided
            formattedDate: formatDate(item.date),
          }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to fetch news")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
    },
    
    fetchNewsBySource: async (api: Api, source: string) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.news.getNewsBySource(source)
        
        if (response.ok && response.data?.news) {
          const processedItems = response.data.news.map((item: any) => ({
            ...item,
            id: item.id || item.link,
            formattedDate: formatDate(item.date),
          }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to fetch news for source")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
    }
  }))

export interface NewsStore extends Instance<typeof NewsStoreModel> {}
export interface NewsStoreSnapshotIn extends SnapshotIn<typeof NewsStoreModel> {}
export interface NewsStoreSnapshotOut extends SnapshotOut<typeof NewsStoreModel> {} 