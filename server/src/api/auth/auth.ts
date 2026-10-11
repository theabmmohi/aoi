import { Router } from "express"

const auth = Router()

import login from "@/api/auth/login"
auth.use("/login", login)

import me from "@/api/auth/me"
auth.use("/me", me)

export default auth
