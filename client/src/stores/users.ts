import { create } from "zustand"

export type User = {
  id: number
  first_name: string
  last_name: string | null
  username: string | null
  is_premium: boolean
  created_at: number
}

export const useUsers = create<{
  users: User[] | null
}>(() => ({
  users: null
}))
