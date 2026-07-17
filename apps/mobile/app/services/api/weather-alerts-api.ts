import { ApisauceInstance } from "apisauce"
import type { WeatherAlertItem } from "../../models/WeatherAlert"

export class WeatherAlertsApi {
  private apisauce: ApisauceInstance

  constructor(apisauce: ApisauceInstance) {
    this.apisauce = apisauce
  }

  /**
   * Get weather alerts
   */
  async getWeatherAlerts() {
    try {
      const url = this.apisauce.getBaseURL() + "/api/getWeatherAlerts"
      if (__DEV__) console.log("Fetching weather alerts from:", url)

      const response = await this.apisauce.get<{ weatherAlerts: WeatherAlertItem[] }>("/api/getWeatherAlerts")

      // More detailed logging
      if (response.ok) {
        if (__DEV__) {
          console.log("Weather Alerts API Response successful, items:", response.data?.weatherAlerts?.length || 0)

          // Check if we actually got data even though the response was "ok"
          if (!response.data || !response.data.weatherAlerts) {
            console.error("API response was ok but no data received:", response.data)
          }

          // Log the first item to check structure
          if (response.data?.weatherAlerts?.[0]) {
            console.log("First weather alert item sample:", JSON.stringify(response.data.weatherAlerts[0]))
          }
        }
      } else {
        console.error("Weather Alerts API Error Response:", response.problem, response.status, response.originalError)
      }
      
      return response
    } catch (error) {
      console.error("Weather Alerts API Error:", error)
      throw error
    }
  }
} 