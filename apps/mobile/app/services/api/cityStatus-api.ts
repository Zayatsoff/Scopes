import { ApiResponse } from "apisauce"
import { Api } from "./api"
import { StatusItem } from "@/components/CityStatus"
import { getGeneralApiProblem } from "./apiProblem"

interface OttawaStatusResponse {
  status: StatusItem[]
}

export class CityStatusApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  /**
   * Fetch Ottawa city status information
   */
  async getOttawaStatus(): Promise<{ kind: string; status?: StatusItem[] }> {
    try {
      // Make the API call
      const response: ApiResponse<OttawaStatusResponse> = await this.api.apisauce.get(
        "https://local-government-app-backend.vercel.app/api/getOttawaStatus"
      )

      // Handle the problem or return the result
      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      if (!response.data) {
        return { kind: "bad-data" }
      }

      const status = response.data.status

      // Add a mock school bus status item
      const schoolBusItem: StatusItem = {
        id: "school-bus-status",
        title: "School Bus Service Status",
        link: "https://ottawaschoolbus.ca/",
        icon: "bus",
        description: "School buses are currently operating normally across the city.",
        date: new Date().toISOString(),
        bool: true, // Enabled state
        scrapedAt: {
          _seconds: Math.floor(Date.now() / 1000),
          _nanoseconds: 0
        }
      }
      
      status.push(schoolBusItem)

      return { kind: "ok", status }
    } catch (e) {
      console.error("Error in getOttawaStatus:", e)
      return { kind: "rejected" }
    }
  }
} 