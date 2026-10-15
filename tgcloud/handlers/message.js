import { api } from "sdk"

export default async function (message, ctx) {
  const inbox = message.chat.type === "private"
  const group = message.chat.type === "group" || message.chat.type === "supergroup"

  const parsed = /^\/(\w+)(?:@(\w+))?(?:\s+([\s\S]*))?$/.exec(message.text ?? "")
  if (parsed?.[2] && parsed[2].toLowerCase() !== BOT_USERNAME.toLowerCase()) return
  const text = parsed?.[1].toLowerCase() // every command is a text & undefined if plain message !
  const args = parsed?.[3] ?? ""

  switch (text) {
    case "start": {
      if (inbox) {
        await api.sendMessage({
          chat_id: message.chat.id,
          text: message.text ?? "(no text)"
        })
      }
    }
    case undefined: {
    }
    default: {
    }
  }
}
