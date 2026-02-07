export interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  duration: number // seconds
  publishedAt: string // ISO 8601
  source: {
    type: 'youtube' | 'vimeo' | 'facebook' | 'manual'
    url: string
  }
}
