import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const to = (x: string) => resolve(dirname(fileURLToPath(import.meta.url)), x)

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 5000
  },
  resolve: {
    alias: {
      "@": to("./src")
    }
  }
})
