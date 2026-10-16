export const routes = [
  {
    path: "/",
    lazy: () => import("@page/app/Index")
  },
  {
    path: "/profile",
    lazy: () => import("@page/app/Profile")
  },
  {
    path: "*",
    lazy: () => import("@page/app/NotFound")
  }
]
