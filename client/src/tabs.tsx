import type { YozoraTab } from "yozora"
import { Home, User } from "lucide-react"
// import { Avatar } from "@ui/avatar"

export const tabs: YozoraTab[] = [
  {
    id: "/",
    label: "Home",
    icon: <Home />
  },
  {
    id: "/profile",
    icon: <User />,
    label: "Profile"
  }
]
