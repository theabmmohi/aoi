import { Home, Users, Settings } from "lucide-react"
import type { YozoraTab } from "yozora"

export const tabs: YozoraTab[] = [
  {
    id: "/",
    label: "Home",
    icon: <Home />
  },
  {
    id: "/users",
    label: "Users",
    icon: <Users />
  },
  {
    id: "/settings",
    label: "Settings",
    icon: <Settings />
  }
]
