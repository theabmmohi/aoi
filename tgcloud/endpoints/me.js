import { authenticate } from "../lib/middlewares/auth.js"

export default authenticate(async (_, ctx) => ctx.owner)
