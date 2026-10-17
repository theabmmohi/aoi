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
    path: "*",
    lazy: () => import("@page/NotFound")
  }
]
