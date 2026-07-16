import { FirestoreTimestampLike } from "./firestoreTimestamp"

export interface CityStatusDTO {
  id: string
  title: string
  link: string
  icon: string
  description: string
  date: string
  bool: boolean
  scrapedAt: FirestoreTimestampLike
}

export interface GetOttawaStatusResponseDTO {
  status: CityStatusDTO[]
}
