export interface StatusItem {
  id: string
  title: string
  link: string
  icon: string
  description: string
  date: string
  bool: boolean
  scrapedAt: {
    _seconds: number
    _nanoseconds: number
  }
  status?: string
} 