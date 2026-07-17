import { ApiResponse } from "apisauce"
import type { GetOttawaAlertsResponseDTO, StatusStoryDTO } from "@scopes/shared-types"
import { Api } from "./api"
import { getGeneralApiProblem } from "./apiProblem"

export class OttawaAlertApi {
  private api: Api

  constructor(api: Api) {
    this.api = api
  }

  /**
   * Fetch the latest Ottawa city banner alert (e.g. an active emergency notice)
   */
  async getOttawaAlerts(): Promise<{ kind: string; alerts?: StatusStoryDTO[] }> {
    try {
      const response: ApiResponse<GetOttawaAlertsResponseDTO> = await this.api.apisauce.get(
        "/api/getOttawaAlerts"
      )

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      if (!response.data) {
        return { kind: "bad-data" }
      }

      return { kind: "ok", alerts: response.data.alerts }
    } catch (e) {
      console.error("Error in getOttawaAlerts:", e)
      return { kind: "rejected" }
    }
  }
}
