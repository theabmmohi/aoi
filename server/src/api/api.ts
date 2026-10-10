import { Router } from "express"

const api = Router()

import auth from "@/api/auth/auth"
api.use("/auth", auth)

export default api
