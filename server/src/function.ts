import type { Context } from "grammy"
import env from "@/env"

export function getHost (): string {
  return "https://" + env.host.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "")
}

export function isAdmin (context: Context): boolean {
  return context.from?.id.toString() === env.adminId
}
