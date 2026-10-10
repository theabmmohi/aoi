import type { Context } from "grammy"
import { isAdmin, getHost } from "@/function"

export default async function start (context: Context) {
  if (!context.chat) return
  switch (context.chat.type) {
    case "private": {
      if (isAdmin(context)) {
        await context.api.setChatMenuButton({
          chat_id: context.from?.id,
          menu_button: {
            type: "web_app",
            text: "Admin",
            web_app: { url: getHost() }
          }
        })
      } else {
        await context.api.setChatMenuButton({
          chat_id: context.from?.id,
          menu_button: { type: "default" }
        })
      }
      break
    }
    case "supergroup":
    case "group": {
      break
    }
  }
}
