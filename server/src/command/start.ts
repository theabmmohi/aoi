import type { Context } from "grammy"
import { isAdmin, getHost, getName } from "@/function"
import { fmt } from "@grammyjs/parse-mode"

export default async function start(context: Context) {
  if (!context.chat) return
  switch (context.chat.type) {
    case "private": {
      await context.replyWithChatAction("typing")
      if (isAdmin(context)) {
        await context.api.setChatMenuButton({
          chat_id: context.from?.id,
          menu_button: {
            type: "web_app",
            text: "Admin",
            web_app: { url: getHost() }
          }
        })
        const reply = [
          fmt`Hello ${getName(context)} 👋`,
          fmt`How are u doing?`
        ]
        await context.reply(reply.join("\n"))
      } else {
        await context.api.setChatMenuButton({
          chat_id: context.from?.id,
          menu_button: { type: "default" }
        })
        const reply = [
          fmt`Hi ${getName(context)} 👋`,
          fmt`\nMost of my commands are for admins, but you can send /info to see your details ✨`,
          fmt`\nIll also echo any text you send me`
        ]
        await context.reply(reply.join("\n"))
      }
      break
    }
    case "supergroup":
    case "group": {
      await context.replyWithChatAction("typing")
      const reply = [
        fmt`Hello everyone 👋`,
        fmt`Im ${context.me.first_name}, happy to be in ${context.chat.title}`
      ]
      await context.reply(reply.join("\n"))
      break
    }
  }
}
