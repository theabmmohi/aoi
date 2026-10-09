import { defineConfig, globalIgnores } from "eslint/config"
import reactRefresh from "eslint-plugin-react-refresh"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"
import globals from "globals"
import js from "@eslint/js"

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      reactRefresh.configs.vite,
      reactHooks.configs.flat.recommended,
      tseslint.configs.recommended,
      js.configs.recommended
    ],
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    files: ["src/components/ui/**"],
    rules: { "react-refresh/only-export-components": "off" }
  }
])
