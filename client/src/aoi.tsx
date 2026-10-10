import { createRoot } from "react-dom/client"
import { StrictMode } from "react"
import App from "@/app"
import "@/aoi.css"

createRoot(document.getElementById("aoi")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
