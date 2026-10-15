import type { RouteObject } from "react-router"

export const routes: RouteObject[] = [
  {
    path: "/",
    lazy: () => import("@page/Index")
  },
  {
    path: "/profile",
    lazy: () => import("@page/Profile")
  },
  {
    path: "*",
    lazy: () => import("@page/NotFound")
  }
]
