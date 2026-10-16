export const routes = [
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
