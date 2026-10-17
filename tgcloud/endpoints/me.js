import { authenticate } from "../lib/middleware/auth.js"

export default authenticate(async (_, ctx) => ctx.owner)
