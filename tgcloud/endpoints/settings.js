import { getSetting, setSetting, delSetting, newSetting} from "../lib/db/settings.js"
import { authenticate } from "../lib/middleware/auth.js"
import { settings } from "../schema.js"
import { EndpointError } from 'sdk'
import { db } from "sdk"

export default authenticate(async (input) => {
  const { operation, data } = input
  switch (operation) {
    case "create": {
      const res = await db.select().from(settings).all()
      return res
      break
    }
    case "read": {
      const res = await db.select().from(settings).all()
      return res
      break
    }
    case "update": {
      const res = await db.select().from(settings).all()
      return res
      break
    }
    case "delete": {
      await db.select().from(settings).all()
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
