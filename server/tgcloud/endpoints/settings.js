import { authenticate } from "../lib/endpoints/auth.js"
import { settings, users } from "../schema.js"
import { api, db, EndpointError } from "sdk"
import { eq } from "sdk/db"

let me

const DEFAULTS = {
  timezone: "UTC"
}

const validate = {
  timezone(value) {
    if (typeof value !== "string") throw new EndpointError("Invalid timezone.")
    try {
      new Intl.DateTimeFormat(undefined, { timeZone: value })
    } catch {
      throw new EndpointError("Invalid timezone.")
    }
  },
  async owner(value) {
    if (!Number.isSafeInteger(value) || value <= 0) throw new EndpointError("Invalid owner id.")
    const known = await db.select().from(users).where(eq(users.id, value)).get()
    if (!known) throw new EndpointError("That user has not started the bot.")
  }
}

export default authenticate(async (input, ctx) => {
  const { operation, data } = input
  switch (operation) {
    case "update": {
      const { key, value } = data ?? {}
      if (!Object.hasOwn(validate, key)) throw new EndpointError("Unknown setting.")
      if (key === "owner" && value === ctx.owner.id) throw new EndpointError("You already own this dashboard.")
      await validate[key](value)

      await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } }).run()
      const res = await db.select().from(settings).where(eq(settings.key, key)).get()

      if (key === "owner") {
        me ??= await api.getMe()
        await Promise.allSettled([
          api.sendMessage({ chat_id: ctx.owner.id, text: `Ownership transferred to <a href="tg://user?id=${value}">${value}</a>`, parse_mode: "HTML" }),
          api.setChatMenuButton({
            chat_id: ctx.owner.id,
            menu_button: { type: "default" }
          }),
          api.sendMessage({ chat_id: value, text: "You are now the owner of this dashboard. Tap Dash to open it." }),
          api.setChatMenuButton({
            chat_id: value,
            menu_button: {
              type: "web_app",
              text: "Dash",
              web_app: { url: `https://app${me.id}.tgcloud.ai` }
            }
          })
        ])
      }
      return res
    }
    default: {
      const rows = await db.select().from(settings).all()
      return { ...DEFAULTS, ...Object.fromEntries(rows.map((row) => [row.key, row.value])) }
    }
  }
})
