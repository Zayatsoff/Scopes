/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import type { ApiConfig } from "./api.types"
import { NewsApi } from "./news-api"
import { PoliceNewsApi } from "./police-news-api"
import { WeatherAlertsApi } from "./weather-alerts-api"
import { TrafficAlertsApi } from "./traffic-alerts-api"
import { CityStatusApi } from "./cityStatus-api"
import { OttawaAlertApi } from "./ottawaAlert-api"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig
  news: NewsApi
  policeNews: PoliceNewsApi
  weatherAlerts: WeatherAlertsApi
  trafficAlerts: TrafficAlertsApi
  cityStatus: CityStatusApi
  ottawaAlert: OttawaAlertApi

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
    
    // Initialize news API
    this.news = new NewsApi(this.apisauce)
    
    // Initialize police news API
    this.policeNews = new PoliceNewsApi(this.apisauce)
    
    // Initialize weather alerts API
    this.weatherAlerts = new WeatherAlertsApi(this.apisauce)
    
    // Initialize traffic alerts API
    this.trafficAlerts = new TrafficAlertsApi(this.apisauce)
    
    // Initialize city status API
    this.cityStatus = new CityStatusApi(this)

    // Initialize Ottawa banner alert API
    this.ottawaAlert = new OttawaAlertApi(this)
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
