import { RouterProvider, createBrowserRouter } from "react-router"
import { createRoot } from "react-dom/client"
import { StrictMode } from "react"

import { HydrateFallback } from "@/router/HydrateFallback"
import { ErrorBoundary } from "@/router/ErrorBoundary"
import { useOwner, type Owner } from "@/stores/owner"
import { serverless } from "@/utils/serverless"
import { Layout } from "@/router/Layout"
import { routes } from "@/router/routes"
import "yozora/styles"
import "@/aoi.css"

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: routes,
    HydrateFallback,
    ErrorBoundary,
    loader: async () => {
      const { data: owner, error } = await serverless<Owner>({ name: "owner" })
      if (error) throw error
      useOwner.setState({ owner })
      return null
    }
  }
])

createRoot(document.getElementById("aoi")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
