export interface NewsDTO {
  id: string
  source: string
  title?: string
  link?: string
  date?: string
  description?: string
  authors?: string
  tags: string[]
}

export interface GetNewsResponseDTO {
  news: NewsDTO[]
}
