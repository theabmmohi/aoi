import type { User } from "@/api/auth/session"
import { createHmac, timingSafeEqual } from "node:crypto"
import { Router } from "express"
import { read } from "@/api/auth/session"
import env from "@/env"

const me = Router()

me.get("/", async (request, response) => {
  const authHeader = request.header("authorization") ?? ""
  if (!authHeader) {
    const user = await read(request)
    if (!user) return response.sendStatus(400)
    if (String(user.id) !== env.adminId) return response.sendStatus(403)
    return response.json(user)
  }

  const params = new URLSearchParams(authHeader.startsWith("tma ") ? authHeader.slice(4) : "")
  const hash = params.get("hash") ?? ""
  params.delete("hash")

  const check = [...params]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(
      ([
        key,
        value
      ]) => `${key}=${value}`
    )
    .join("\n")
  const secret = createHmac("sha256", "WebAppData").update(env.botToken).digest()
  const expect = createHmac("sha256", secret).update(check).digest()
  const given = Buffer.from(hash, "hex")
  const age = Date.now() / 1000 - Number(params.get("auth_date"))

  if (given.length !== expect.length || !timingSafeEqual(given, expect) || !(age >= -60 && age < 86400)) return response.sendStatus(401)
  const telegram = JSON.parse(params.get("user") ?? "{}") as {
     id: number
     first_name: string
     last_name?: string
     username?: string
     photo_url?: string
  }
  if (String(telegram.id) !== env.adminId) return response.sendStatus(403)
  const user: User = {
    id: telegram.id,
    name: [telegram.first_name, telegram.last_name].filter(Boolean).join(" "),
    username: telegram.username,
    photo_url: telegram.photo_url
  }
  response.json(user)
})

export default me
