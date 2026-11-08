import type { RouteObject } from "react-router"

export const routes: RouteObject[] = [
  {
    path: "/",
    lazy: () => import("@/pages/Home")
  },
  {
    path: "/users",
    lazy: () => import("@/pages/Users")
  },
  {
    path: "/settings",
    lazy: () => import("@/pages/Settings")
  }
]
