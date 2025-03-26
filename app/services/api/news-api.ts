import { Api } from "./api"
import { ApiResponse } from "apisauce"
import type { NewsItem } from "./api.types"

export class NewsApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  /**
   * Get latest news items
   */
  async getNews(): Promise<ApiResponse<{ news: NewsItem[] }>> {
    // Assuming you have an API endpoint to fetch news from Firestore
    return this.api.apisauce.get("/api/news")
  }

  /**
   * Get news filtered by source
   */
  async getNewsBySource(source: string): Promise<ApiResponse<{ news: NewsItem[] }>> {
    return this.api.apisauce.get("/api/news", { source })
  }
} 