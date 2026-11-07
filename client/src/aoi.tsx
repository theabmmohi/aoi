import { RouterProvider, createBrowserRouter } from "react-router"
import { createRoot } from "react-dom/client"
import { StrictMode } from "react"

import { HydrateFallback } from "@/router/HydrateFallback"
import { ErrorBoundary } from "@/router/ErrorBoundary"
import { Layout } from "@/router/Layout"
import { routes } from "@/router/routes"
import { useUser } from "@/stores/user"
import "yozora/styles"
import "@/aoi.css"

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: routes,
    HydrateFallback,
    ErrorBoundary,
    loader: async () => {
      useUser.setState({user: {
        id:1234,
        first_name: "Im",
        photo_url: ""
      }})
      return null
    }
  }
])

createRoot(document.getElementById("aoi")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
