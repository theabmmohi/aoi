import type { Context } from "grammy"
import env from "@/env"

export function getHost(): string {
  return (
    "https://" +
    env.host
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/+$/, "")
  )
}

export function isAdmin(context: Context): boolean {
  return context.from?.id.toString() === env.adminId
}

export function getName(context: Context): string {
  return (
    [
      context.from?.first_name,
      context.from?.last_name
    ]
      .filter(Boolean)
      .join(" ") || "there"
  )
}
