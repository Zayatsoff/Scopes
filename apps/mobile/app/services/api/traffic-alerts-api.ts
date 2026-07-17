import { ApisauceInstance } from "apisauce"
import type { TrafficAlertItem } from "../../models/TrafficAlert"

export class TrafficAlertsApi {
  private apisauce: ApisauceInstance

  constructor(apisauce: ApisauceInstance) {
    this.apisauce = apisauce
  }

  /**
   * Get traffic alerts
   */
  async getTrafficAlerts() {
    try {
      const url = this.apisauce.getBaseURL() + "/api/getTrafficAlerts"
      if (__DEV__) console.log("Fetching traffic alerts from:", url)

      const response = await this.apisauce.get<{ trafficAlerts: { events: TrafficAlertItem[] } }>("/api/getTrafficAlerts")

      // More detailed logging
      if (response.ok) {
        if (__DEV__) {
          console.log("Traffic Alerts API Response successful, items:", response.data?.trafficAlerts?.events?.length || 0)

          // Check if we actually got data even though the response was "ok"
          if (!response.data || !response.data.trafficAlerts || !response.data.trafficAlerts.events) {
            console.error("API response was ok but no data received:", response.data)
          }

          // Log the first item to check structure
          if (response.data?.trafficAlerts?.events?.[0]) {
            console.log("First traffic alert item sample:", JSON.stringify(response.data.trafficAlerts.events[0]))
          }
        }
      } else {
        console.error("Traffic Alerts API Error Response:", response.problem, response.status, response.originalError)
      }
      
      return response
    } catch (error) {
      console.error("Traffic Alerts API Error:", error)
      throw error
    }
  }
} 