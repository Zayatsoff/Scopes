import { ApisauceInstance } from "apisauce"
import type { PoliceNewsItem } from "../../models/PoliceNews"

export class PoliceNewsApi {
  private apisauce: ApisauceInstance

  constructor(apisauce: ApisauceInstance) {
    this.apisauce = apisauce
  }

  /**
   * Get police news items
   */
  async getPoliceNews() {
    try {
      const url = this.apisauce.getBaseURL() + "/api/getPoliceNews"
      console.log("Fetching police news from:", url)
      
      const response = await this.apisauce.get<{ policeNews: PoliceNewsItem[] }>("/api/getPoliceNews")
      
      // More detailed logging
      if (response.ok) {
        console.log("Police News API Response successful, items:", response.data?.policeNews?.length || 0)
        
        // Check if we actually got data even though the response was "ok"
        if (!response.data || !response.data.policeNews) {
          console.error("API response was ok but no data received:", response.data)
        }
        
        // Log the first item to check structure
        if (response.data?.policeNews?.[0]) {
          console.log("First police news item sample:", JSON.stringify(response.data.policeNews[0]))
        }
      } else {
        console.error("Police News API Error Response:", response.problem, response.status, response.originalError)
      }
      
      return response
    } catch (error) {
      console.error("Police News API Error:", error)
      throw error
    }
  }
} 