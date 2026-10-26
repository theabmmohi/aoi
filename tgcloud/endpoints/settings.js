import { authenticate } from "../lib/middleware/auth.js"
import { setSetting } from "../lib/db/settings.js"
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
      const res = await setSetting(data)
      if (data.key === "owner") {
        me ??= await api.getMe()
        await Promise.allSettled([
          api.setChatMenuButton({
            chat_id: ctx.admin.id,
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
      break
    }
    default: {
      const rows = await db.select().from(settings).all()
      return { ...DEFAULTS, ...Object.fromEntries(rows.map((row) => [row.key, row.value])) }
      break
    }
  }
})
