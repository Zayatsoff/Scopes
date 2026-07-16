export interface TrafficEventDTO {
  id: number
  message: string
  headline?: string
  status?: string
  eventType?: string
  cause?: string
  schedule?: Array<{ startDateTime?: string; endDateTime?: string }>
  geodata?: { coordinates?: string; type?: string }
  improvedHeadline?: string
}

export interface TrafficAlertsDocDTO {
  events: TrafficEventDTO[]
  scrapedAt: string
  date: string
}

export interface GetTrafficAlertsResponseDTO {
  trafficAlerts: TrafficAlertsDocDTO
  note?: string
}
