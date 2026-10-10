import { Router } from "express"

const api = Router()

import auth from "@/api/auth/auth"
api.use("/auth", auth)

import authenticate from "@/api/authenticate"
api.post("/authenticate", authenticate)

export default api
