import { start } from "../lib/handlers/message/start.js"
import { info } from "../lib/handlers/message/info.js"
import { api } from "sdk"

let me

export default async function (message) {
  me ??= await api.getMe()
  const parsed = /^\/(\w+)(?:@(\w+))?(?:\s+([\s\S]*))?$/.exec(message.text ?? "")
  if (parsed?.[2] && parsed[2].toLowerCase() !== me.username.toLowerCase()) return
  const command = parsed?.[1].toLowerCase() // undefined for plain messages !
  // const args = parsed?.[3] ?? ""

  switch (command) {
    case "start":
      return start(message, me)
    case "info":
      return info(message)
  }
}
