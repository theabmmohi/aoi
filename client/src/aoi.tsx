import { createBrowserRouter } from "react-router"
import { RouterProvider } from "react-router/dom"
import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { routes } from "@/routes"
import { App } from "@/app"
import "yozora/styles"
import "@/aoi.css"

const HydrateFallback = () => <p>Wait a moment</p>
const ErrorBoundary = () => <p>An error occurred, kindly refresh the page</p>

const router = createBrowserRouter([
  {
    element: <App />,
    children: routes,
    HydrateFallback,
    ErrorBoundary
  }
])

createRoot(document.getElementById("aoi")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
