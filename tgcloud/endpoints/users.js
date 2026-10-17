import { getUser, newUser, setUser, delUser } from "../lib/db/users.js"
import { authenticate } from "../lib/middleware/auth.js"
import { EndpointError, db } from "sdk"
import { users } from "../schema.js"

export default authenticate(async ({ action = "all", id, data = {} }) => {
  const user = id ? await getUser(id) : null

  switch (action) {
    case "all": {
      const rows = await db.select().from(users).all()
      return rows.map((u) => ({ ...u, created_at: u.created_at.getTime() }))
    }
    case "create": {
      if (!id) throw new EndpointError("id is required")
      if (user) throw new EndpointError("User already exists")
      if (!data.first_name) throw new EndpointError("first_name is required")
      const created = await newUser(id, data)
      return { ...created, created_at: created.created_at.getTime() }
    }
    case "read": {
      if (!user) throw new EndpointError("User not found")
      return { ...user, created_at: user.created_at.getTime() }
    }
    case "update": {
      if (!user) throw new EndpointError("User not found")
      if (typeof data.blocked !== "boolean") throw new EndpointError("Nothing to update")
      const updated = await setUser(id, { blocked: data.blocked })
      return { ...updated, created_at: updated.created_at.getTime() }
    }
    case "delete": {
      if (!user) throw new EndpointError("User not found")
      await delUser(id)
      return { id }
    }
    default:
      throw new EndpointError("Unknown action")
  }
})
