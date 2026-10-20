import { authenticate } from "../lib/middleware/auth.js"
import { setSetting } from "../lib/db/settings.js"
import { settings } from "../schema.js"
import { EndpointError } from "sdk"
import { db } from "sdk"

const DEFAULTS = {
  timezone: "UTC"
}

export default authenticate(async (input) => {
  const { operation, data } = input
  switch (operation) {
    case "update": {
      const res = setSetting(data)
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
