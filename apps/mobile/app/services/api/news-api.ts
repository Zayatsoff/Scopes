import { ApisauceInstance } from "apisauce"
import type { NewsItem } from "../../models/News"

export class NewsApi {
  private apisauce: ApisauceInstance

  constructor(apisauce: ApisauceInstance) {
    this.apisauce = apisauce
  }

  /**
   * Get latest news items
   */
  async getNews() {
    try {
      if (__DEV__) console.log("Fetching news from:", this.apisauce.getBaseURL() + "/api/getNews")
      const response = await this.apisauce.get<{ news: NewsItem[] }>("/api/getNews")
      if (__DEV__) console.log("News API Response:", response)
      return response
    } catch (error) {
      console.error("News API Error:", error)
      throw error
    }
  }

  /**
   * Get news filtered by source
   */
  async getNewsBySource(source: string) {
    try {
      if (__DEV__) console.log("Fetching news from source:", source)
      const response = await this.apisauce.get<{ news: NewsItem[] }>("/api/getNews", { source })
      if (__DEV__) console.log("News API Response:", response)
      return response
    } catch (error) {
      console.error("News API Error:", error)
      throw error
    }
  }
} 