import { resolve } from "node:path"
import { config } from "dotenv"

config({
  path: resolve(import.meta.dirname, "../../.env")
})

const port = Number.parseInt(process.env.PORT ?? "3000", 10)
if (!Number.isInteger(port) || port <= 0) throw new Error("Invalid PORT")

const required = (name: string): string => {
  const variable = process.env[name]
  if (!variable) throw new Error(`Missing variable ${name}`)
  return variable
}

export default {
  databaseUrl: required("DATABASE_URL"),
  botToken: required("BOT_TOKEN"),
  secret: required("SECRET"),
  host: required("HOST"),
  port
}
