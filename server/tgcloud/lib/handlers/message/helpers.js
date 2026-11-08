import { api } from "sdk"

export const inbox = (message) => message.chat.type === "private"
export const group = (message) => message.chat.type === "group" || message.chat.type === "supergroup"

export const typing = (message) => api.sendChatAction({ action: "typing", chat_id: message.chat.id })
export const fullName = (message) => [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ")
export const name = (message) => fullName(message) || "there"
export const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
export const val = (v) => (v ? esc(v) : "Unavailable")
export const say = (message, text) => api.sendMessage({ chat_id: message.chat.id, text, parse_mode: "HTML" })
