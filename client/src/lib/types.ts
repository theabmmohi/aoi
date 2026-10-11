export type User = {
  id: number
  name: string
  username?: string
  photo_url?: string
}

export type ApiError = {
  status: number | null
  message: string
}
