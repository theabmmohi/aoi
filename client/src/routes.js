export const routes = [
  {
    path: "/",
    lazy: () => import("@page/Index")
  },
  {
    path: "/users",
    lazy: () => import("@page/Users")
  },
  {
    path: "/settings",
    lazy: () => import("@page/Settings")
  }
]
