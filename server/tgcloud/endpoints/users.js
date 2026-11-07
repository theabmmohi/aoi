import { authenticate } from "../lib/middleware/auth.js"
import { users } from "../schema.js"
import { desc } from "sdk/db"
import { db } from "sdk"

export default authenticate(async () => {
  const rows = await db.select().from(users).orderBy(desc(users.created_at)).all()
  return rows.map((user) => ({ ...user, created_at: user.created_at.getTime() }))
})
