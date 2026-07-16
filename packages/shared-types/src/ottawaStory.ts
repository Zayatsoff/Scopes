import { FirestoreTimestampLike } from "./firestoreTimestamp"

export interface StatusStoryDTO {
  id: string
  title?: string
  status?: string
  lastUpdated?: string
  description?: string
  affectedAreas?: string[]
  recommendations?: string[]
  sourceUrl: string
  scrapedAt: FirestoreTimestampLike
}

export interface GetOttawaAlertsResponseDTO {
  alerts: StatusStoryDTO[]
}
