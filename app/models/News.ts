import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatDate } from "@/utils/formatDate"
import { formatRelativeTime } from "@/utils/formatRelativeTime"
import { Api } from "@/services/api"

/**
 * Source to full name mapping
 */
const SOURCE_NAMES = {
  "cbc.ca": "CBC News",
  "globalnews.ca": "Global News",
  "ctv.ca": "CTV News",
  "ctvnews.ca": "CTV News",
  "thestar.com": "Toronto Star",
  "nationalpost.com": "National Post",
  "ottawa.ca": "City of Ottawa",
  "obj.ca": "Ottawa Business Journal",
  "ottawacitizen.com": "Ottawa Citizen",
  "ottawasun.com": "Ottawa Sun",
  "ottawamatters.com": "Ottawa Matters",
}

/**
 * Helper function to convert string to title case
 */
const toTitleCase = (str: string) => {
  // Special case for short abbreviations - keep them uppercase
  if (str.length <= 3) return str.toUpperCase();
  
  // Split by spaces, dashes and underscores
  return str.split(/[\s-_]+/)
    .map(word => {
      // Keep common abbreviations uppercase
      if (word.toLowerCase() === 'cbc' || word.toLowerCase() === 'ctv') {
        return word.toUpperCase();
      }
      // For other words, capitalize first letter and lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

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
      // Try to find a full name match from our mapping
      const domain = self.source.replace(/^www\./i, "").toLowerCase()
      
      // Check if we have a direct match in our mapping
      for (const [key, value] of Object.entries(SOURCE_NAMES)) {
        if (domain.includes(key)) {
          return value
        }
      }
      
      // Fallback to a properly formatted name if no match
      const sourceName = domain.split(".")[0];
      return toTitleCase(sourceName);
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
      // Always return newest first for home screen
      return [...self.items]
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return dateB - dateA // Always sort newest first, regardless of sortNewestFirst setting
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
            formattedDate: formatRelativeTime(item.date),
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
    
    refreshNews: async (api: Api) => {
      // Similar to fetchNews but intended to be used with pull-to-refresh
      self.setProp("isLoading", true)
      self.setProp("error", null)
      
      try {
        const response = await api.news.getNews()
        
        if (response.ok && response.data?.news) {
          // Process the news data to add formatted dates and ensure IDs
          const processedItems = response.data.news.map((item: any) => ({
            ...item,
            id: item.id || item.link,
            formattedDate: formatRelativeTime(item.date),
          }))
          
          self.setProp("items", processedItems)
        } else {
          self.setProp("error", "Failed to refresh news")
        }
      } catch (error) {
        self.setProp("error", String(error))
      } finally {
        self.setProp("isLoading", false)
      }
      
      return true // Return success indicator for the refresh control
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
            formattedDate: formatRelativeTime(item.date),
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