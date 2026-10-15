import { api } from "sdk"

let me

export default async function (message, ctx) {
  const inbox = message.chat.type === "private"
  const group = message.chat.type === "group" || message.chat.type === "supergroup"

  me ??= await api.getMe()
  const parsed = /^\/(\w+)(?:@(\w+))?(?:\s+([\s\S]*))?$/.exec(message.text ?? "")
  if (parsed?.[2] && parsed[2].toLowerCase() !== me.username.toLowerCase()) return
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
