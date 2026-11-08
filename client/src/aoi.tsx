import { RouterProvider, createBrowserRouter } from "react-router"
import { createRoot } from "react-dom/client"
import { StrictMode } from "react"

import { HydrateFallback } from "@/router/HydrateFallback"
import { ErrorBoundary } from "@/router/ErrorBoundary"
import { Layout } from "@/router/Layout"
import { routes } from "@/router/routes"

import { useSettings, type Settings } from "@/stores/settings"
import { useOwner, type Owner } from "@/stores/owner"
import { useUsers, type User } from "@/stores/users"
import { serverless } from "@/utils/serverless"
import "yozora/styles"
import "@/aoi.css"

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: routes,
    HydrateFallback,
    ErrorBoundary,
    loader: async () => {
      const [{ data: owner, error: ownerError }, { data: users, error: usersError }, { data: settings, error: settingsError }] = await Promise.all([serverless<Owner>({ name: "owner" }), serverless<User[]>({ name: "users" }), serverless<Settings>({ name: "settings" })])
      if (ownerError) throw ownerError
      if (usersError) throw usersError
      if (settingsError) throw settingsError
      useOwner.setState({ owner })
      useUsers.setState({ users })
      useSettings.setState({ settings })
      return null
    }
  }
])

createRoot(document.getElementById("aoi")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
