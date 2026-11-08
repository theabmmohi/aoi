import { create } from "zustand"

export type Owner = {
  id: number
  first_name: string
  last_name?: string
  photo_url: string
  username?: string
}

export const useOwner = create<{
  owner: Owner | null
}>(() => ({
  owner: null
}))
