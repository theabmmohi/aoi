import { newSetting } from "../lib/db/settings.js"
import { setUser } from "../lib/db/users.js"
import { api } from "sdk"

const typing = (message) => api.sendChatAction({ action: "typing", chat_id: message.chat.id })
const fullName = (message) => [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ")
const name = (message) => fullName(message) || "there"
const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const val = (v) => (v ? esc(v) : "Unavailable")
const say = (message, text) => api.sendMessage({ chat_id: message.chat.id, text, parse_mode: "HTML" })

// Ignore this const, uncomment line 62 and comment line 63 !!
const special = [
  6541920047, 6589293488
]

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
        await setUser({ id: message.from.id, user: message.from })
        const owner = (await newSetting({ key: "owner", value: message.chat.id }))?.value
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
        const text = isOwner ? [`Hello ${esc(name(message))} 👋\n`, `How are u doing?`] : [`Hello ${esc(name(message))} 👋\n`, `Most of my commands are for admins, but you can send /info to see your details ✨`, `Ill also echo any text you send me`]
        await say(message, text.join("\n"))
      }
      if (group) {
        await typing(message)
        const text = [`Hello everyone 👋\n`, `Im ${esc(me.first_name)}, happy to be in ${esc(message.chat.title)}`]
        await say(message, text.join("\n"))
      }
      break
    }
    case "info": {
      if (inbox) {
        await typing(message)
        const { from } = message
        // const text = [`Your details 👤\n`, `Name: ${val(fullName(message))}`, `Username: ${from?.username ? "@" + esc(from.username) : "Unavailable"}`, `Id: <code>${from?.id ?? message.chat.id}</code>`, `Language: ${val(from?.language_code)}\n`, `<tg-spoiler>${from?.is_premium ? "And you are a premium user !!" : "And you are not a premium user !!"}</tg-spoiler>`]
        const text = [`Your details 👤\n`, `Name: ${val(fullName(message))}`, `Username: ${from?.username ? "@" + esc(from.username) : "Unavailable"}`, `Id: <code>${from?.id ?? message.chat.id}</code>`, `Language: ${val(from?.language_code)}\n`, `<tg-spoiler>${special.includes(Number(from.id ?? message.chat.id)) ? "And you are a special user !!" : from?.is_premium ? "And you are a premium user !!" : "And you are not a premium user !!"}</tg-spoiler>`]
        await say(message, text.join("\n"))
      }
      if (group) {
        await typing(message)
        const { chat } = message
        const text = [`Group details 👥\n`, `Title: ${val(chat.title)}`, `Username: ${chat.username ? "@" + esc(chat.username) : "Unavailable"}`, `Id: <code>${chat.id}</code>`, `Type: ${val(chat.type)}`]
        await say(message, text.join("\n"))
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
