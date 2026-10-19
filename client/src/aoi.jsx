import { createBrowserRouter, useRouteError } from "react-router"
import { serverlessCall } from "@lib/serverlessCall"
import { RouterProvider } from "react-router/dom"
import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { routes } from "@/routes"
import { App } from "@/app"
import "yozora/styles"
import "@/aoi.css"

const HydrateFallback = () => <></>
const ErrorBoundary = () => {
  const error = useRouteError()
  return (
    <div className="overflow-x-hidden p-5">
      <code>{error.message}</code>
      <pre className="overflow-x-auto border p-2.5">{JSON.stringify(error, null, 2)}</pre>
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <App />,
    children: routes,
    HydrateFallback,
    ErrorBoundary,
    id: "app",
    loader: async () => {
      const me = await serverlessCall("me")
      const users = await serverlessCall("users")
      const settings = await serverlessCall("settings")
      // await new Promise((res) => setTimeout(res, 2500))
      return { me, users, settings }
    }
  }
])

createRoot(document.getElementById("aoi")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
