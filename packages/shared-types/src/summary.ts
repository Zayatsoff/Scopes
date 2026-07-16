import { FirestoreTimestampLike } from "./firestoreTimestamp"

export type SummarySection = "Police" | "Weather" | "Traffic"

export interface SummaryDTO {
  id: string
  section: SummarySection
  date: string
  summary: string
  generatedAt: FirestoreTimestampLike
}

export interface GetSummariesResponseDTO {
  summaries: SummaryDTO[]
}
