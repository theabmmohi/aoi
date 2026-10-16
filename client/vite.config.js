import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"

const path = (target) => fileURLToPath(new URL(target, import.meta.url))

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path("./src"),
      "@ui": path("./src/components/ui"),
      "@lib": path("./src/lib"),
      "@page": path("./src/pages")
    }
  }
})
