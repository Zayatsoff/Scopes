import { FirestoreTimestampLike } from "./firestoreTimestamp"

export interface WeatherAlertDTO {
  id: string
  title?: string
  link: string
  pubDate?: string
  isoDate?: string
  summary?: string | null
  locationsAffected: string[]
  effectiveTime?: string | null
  alertTime?: string
  type?: "weatherAlert"
  scrapedAt: FirestoreTimestampLike
}

export interface GetWeatherAlertsResponseDTO {
  weatherAlerts: WeatherAlertDTO[]
}
