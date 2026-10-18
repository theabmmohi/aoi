import { setSetting, delSetting, newSetting } from "../lib/db/settings.js"
import { authenticate } from "../lib/middleware/auth.js"
import { settings } from "../schema.js"
import { EndpointError } from "sdk"
import { db } from "sdk"

export default authenticate(async (input) => {
  const { operation, data } = input
  switch (operation) {
    case "create": {
      const res = newSetting(data)
      return res
      break
    }
    case "update": {
      const res = setSetting(data)
      return res
      break
    }
    case "delete": {
      await delSetting(data)
      return
      break
    }
    default: {
      const rows = await db.select().from(settings).all()
      return rows
      break
    }
  }
})
