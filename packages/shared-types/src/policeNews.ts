import { FirestoreTimestampLike } from "./firestoreTimestamp"

export interface PoliceNewsDTO {
  id: string
  title: string
  link?: string
  date: string
  categories?: string[]
  excerpt?: string
  scrapedAt: FirestoreTimestampLike
}

export interface GetPoliceNewsResponseDTO {
  policeNews: PoliceNewsDTO[]
}
