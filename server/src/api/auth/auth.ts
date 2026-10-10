import { Router } from "express"

const auth = Router()

import me from "@/api/auth/me"
auth.use("/me", me)

export default auth
