import { authenticate } from "../lib/middleware/auth.js"
import { settings } from "../schema.js"
import { api, db } from "sdk"

const DEFAULTS = {
  timezone: "UTC"
}

let me

export default authenticate(async (input, ctx) => {
  const { operation, data } = input
  switch (operation) {
    case "update": {
      const { key, value } = data
      if (!Object.hasOwn(validate, key)) throw new EndpointError("Unknown setting.")
      validate[key](value)

      await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } }).run()
      const res = await db.select().from(settings).where(eq(settings.key, key)).get()

      if (data.key === "owner") {
        me ??= await api.getMe()
        await Promise.allSettled([
          api.setChatMenuButton({
            chat_id: ctx.owner.id,
            menu_button: { type: "default" }
          }),
          api.setChatMenuButton({
            chat_id: data.value,
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
