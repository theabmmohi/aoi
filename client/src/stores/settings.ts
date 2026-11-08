import { create } from "zustand"

export type Settings = {
  timezone: string
  owner: number
}

export const useSettings = create<{
  settings: Settings | null
}>(() => ({
  settings: null
}))
