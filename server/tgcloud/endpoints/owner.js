import { authenticate } from "../lib/endpoints/auth.js"
export default authenticate(async (_, ctx) => ctx.owner)
