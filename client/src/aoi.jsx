import { createBrowserRouter, useRouteError } from "react-router"
import { serverlessCall } from "@lib/serverlessCall"
import { RouterProvider } from "react-router/dom"
import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { routes } from "@/routes"
import { App } from "@/app"
import "yozora/styles"
import "@/aoi.css"

const HydrateFallback = () => <p>Wait a moment</p>
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
    loader: async () => {
      const [, me] = await Promise.all([new Promise((res) => setTimeout(res, 2500)), serverlessCall("me")])
      return { me }
    }
  }
])

createRoot(document.getElementById("aoi")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
