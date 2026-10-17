import { authenticate } from "../lib/middlewares/auth.js"
import { users } from "../schema.js"
import { db } from "sdk"

export default authenticate(async (input, ctx) => db.select().from(users).all())
