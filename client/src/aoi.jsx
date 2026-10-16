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
const isTelegram = () => {
  if (!window.Telegram?.WebApp?.initData) throw redirect("/platform-error")
}
const isAdmin = async () => {
  try {
    me ??= await serverlessCall("me")
  } catch (error) {
    if (error.message === "FORBIDDEN") throw redirect("/forbidden")
    else console.log(error)
    throw error
  }
}

const router = createBrowserRouter([
  {
    path: "/platform-error",
    lazy: () => import("@page/PlatformError"),
    HydrateFallback
  },
  {
    path: "/forbidden",
    lazy: () => import("@page/Forbidden"),
    HydrateFallback
  },
  {
    id: "app",
    middleware: [isTelegram.isAdmin],
    element: <App />,
    children: routes,
    loader: () => me,
    HydrateFallback,
    ErrorBoundary
  }
])

createRoot(document.getElementById("aoi")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
