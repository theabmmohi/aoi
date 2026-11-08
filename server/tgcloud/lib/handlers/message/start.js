import { esc, group, inbox, name, say, typing } from "./helpers.js"
import { settings, users } from "../../../schema.js"
import { api, db } from "sdk"
import { eq } from "sdk/db"

export async function start(message, me) {
  if (inbox(message)) {
    await typing(message)

    const { from } = message
    const values = {
      first_name: from.first_name,
      last_name: from.last_name ?? null,
      username: from.username ?? null,
      is_premium: !!from.is_premium
    }
    await db
      .insert(users)
      .values({ id: from.id, ...values })
      .onConflictDoUpdate({ target: users.id, set: values })
      .run()

    // The first person to /start becomes the owner, later calls change nothing.
    await db.insert(settings).values({ key: "owner", value: message.chat.id }).onConflictDoNothing({ target: settings.key }).run()
    const owner = (await db.select().from(settings).where(eq(settings.key, "owner")).get())?.value
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

  if (group(message)) {
    await typing(message)
    const text = [`Hello everyone 👋\n`, `Im ${esc(me.first_name)}, happy to be in ${esc(message.chat.title)}`]
    await say(message, text.join("\n"))
  }
}
