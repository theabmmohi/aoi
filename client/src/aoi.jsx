import { createBrowserRouter, redirect } from "react-router"
import { serverlessCall } from "@lib/serverlessCall"
import { RouterProvider } from "react-router/dom"
import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import { routes } from "@/routes"
import { App } from "@/app"
import "yozora/styles"
import "@/aoi.css"

let me

const HydrateFallback = () => <p>Wait a moment</p>
const ErrorBoundary = () => <p>An error occurred, kindly refresh the page</p>
const isTelegram = async () => {
  if (!window.Telegram?.WebApp?.initData) throw redirect("/platform-error")
  try {
    me ??= await serverlessCall("me")
    console.log(me)
  } catch (error) {
    console.error(error)
  }
}

const router = createBrowserRouter([
  {
    path: "/platform-error",
    lazy: () => import("@page/PlatformError"),
    HydrateFallback
  },
  {
    middleware: [isTelegram],
    element: <App />,
    children: routes,
    HydrateFallback,
    ErrorBoundary
  }
])

createRoot(document.getElementById("aoi")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
