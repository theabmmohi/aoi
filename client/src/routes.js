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
    path: "/platform-error",
    lazy: () => import("@page/PlatformError")
  },
  {
    path: "*",
    lazy: () => import("@page/NotFound")
  }
]
