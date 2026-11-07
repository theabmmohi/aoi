import { create } from "zustand"

export type User = {
  id: number
  first_name: string
  last_name?: string
  photo_url: string
  username?: string
}

export const useUser = create<{
  user: User | null
}>(() => ({
  user: null
}))
