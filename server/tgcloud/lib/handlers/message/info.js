import { esc, fullName, group, inbox, say, typing, val } from "./helpers.js"

// Ignore this const, swap the two `text` lines below to turn the special-user line on or off !!
const special = [6541920047, 6589293488]

export async function info(message) {
  if (inbox(message)) {
    await typing(message)
    const { from } = message
    // const text = [`Your details 👤\n`, `Name: ${val(fullName(message))}`, `Username: ${from?.username ? "@" + esc(from.username) : "Unavailable"}`, `Id: <code>${from?.id ?? message.chat.id}</code>`, `Language: ${val(from?.language_code)}\n`, `<tg-spoiler>${from?.is_premium ? "And you are a premium user !!" : "And you are not a premium user !!"}</tg-spoiler>`]
    const text = [`Your details 👤\n`, `Name: ${val(fullName(message))}`, `Username: ${from?.username ? "@" + esc(from.username) : "Unavailable"}`, `Id: <code>${from?.id ?? message.chat.id}</code>`, `Language: ${val(from?.language_code)}\n`, `<tg-spoiler>${special.includes(Number(from.id ?? message.chat.id)) ? "And you are a special user !!" : from?.is_premium ? "And you are a premium user !!" : "And you are not a premium user !!"}</tg-spoiler>`]
    await say(message, text.join("\n"))
  }

  if (group(message)) {
    await typing(message)
    const { chat } = message
    const text = [`Group details 👥\n`, `Title: ${val(chat.title)}`, `Username: ${chat.username ? "@" + esc(chat.username) : "Unavailable"}`, `Id: <code>${chat.id}</code>`, `Type: ${val(chat.type)}`]
    await say(message, text.join("\n"))
  }
}
