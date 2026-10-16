export const routes = [
  {
    path: "/",
    lazy: () => import("@page/Index")
  },
  {
    path: "*",
    lazy: () => import("@page/NotFound")
  }
]
