import { authenticate } from "../lib/middleware/auth.js"
import { users } from "../schema.js"
import { db } from "sdk"

export default authenticate(async () => await db.select().from(users).all())
