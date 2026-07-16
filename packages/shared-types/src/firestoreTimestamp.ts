// client-side shape of a resolved Firestore Timestamp, as it arrives over JSON/HTTP
export interface FirestoreTimestampLike {
  _seconds: number
  _nanoseconds: number
}
