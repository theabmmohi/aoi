import { newSetting } from "../lib/settings.js"
import { api } from "sdk"

const typing = (message) => api.sendChatAction({ action: "typing", chat_id: message.chat.id })
const name = (message) => [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") || "there"
const say = (message, text) => api.sendMessage({ chat_id: message.chat.id, text })

let me

export default async function (message) {
  const inbox = message.chat.type === "private"
  const group = message.chat.type === "group" || message.chat.type === "supergroup"

  me ??= await api.getMe()
  const parsed = /^\/(\w+)(?:@(\w+))?(?:\s+([\s\S]*))?$/.exec(message.text ?? "")
  if (parsed?.[2] && parsed[2].toLowerCase() !== me.username.toLowerCase()) return
  const text = parsed?.[1].toLowerCase() // every command is a text & undefined if plain message !
  // const args = parsed?.[3] ?? ""

  switch (text) {
    case "start": {
      if (inbox) {
        await typing(message)
        const owner = await newSetting("owner", message.chat.id)
        const isOwner = owner === message.chat.id
        await api.setChatMenuButton({
          chat_id: message.chat.id,
          menu_button: isOwner
            ? {
                type: "web_app",
                text: "Dash",
                web_app: { url: `https://app${me.id}.tgcloud.ai` }
              }
            : {
                type: "default"
              }
        })
        await say(message, isOwner ? `Hello ${name(message)} 👋\nHow are u doing?` : `Hi ${name(message)} 👋 \n\nMost of my commands are for admins, but you can send /info to see your details ✨\n\nIll also echo any text you send me`)
      }
      if (group) {
        await typing(message)
        await say(message, `Hello everyone 👋\nIm ${me.first_name}, happy to be in ${message.chat.title}`)
      }
      break
    }
    case undefined: {
      break
    }
    default: {
      break
    }
  }
}
