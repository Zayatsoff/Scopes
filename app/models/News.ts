import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatDate } from "@/utils/formatDate"

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
    authors: types.maybeNull(types.string),
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
  .actions((self) => ({
    fetchNews: async (api: any) => {
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.news.getNews()
        
        if (response.ok && response.data?.news) {
          // Process the news data to add formatted dates and IDs
          const processedItems = response.data.news.map((item: any, index: number) => ({
            ...item,
            id: item.link || `news-${index}`,
            formattedDate: formatDate(item.date),
          }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", response.problem || "Failed to fetch news")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
    },
    
    toggleSortOrder: () => {
      self.setProp("sortNewestFirst", !self.sortNewestFirst)
    },
  }))
  .views((self) => ({
    get sortedItems() {
      // Return a sorted copy of the items based on date
      return [...self.items].sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return self.sortNewestFirst ? dateB - dateA : dateA - dateB
      })
    },
    
    get latestItems() {
      // Return the 5 most recent items for the home screen
      return [...self.items]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    },
  }))

export interface NewsItem extends Instance<typeof NewsItemModel> {}
export interface NewsItemSnapshotIn extends SnapshotIn<typeof NewsItemModel> {}
export interface NewsItemSnapshotOut extends SnapshotOut<typeof NewsItemModel> {}

export interface NewsStore extends Instance<typeof NewsStoreModel> {}
export interface NewsStoreSnapshotIn extends SnapshotIn<typeof NewsStoreModel> {}
export interface NewsStoreSnapshotOut extends SnapshotOut<typeof NewsStoreModel> {} 