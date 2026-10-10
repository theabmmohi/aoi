import type { Request, Response } from "express"
import { createHmac, timingSafeEqual } from "node:crypto"
import env from "@/env"

export default function Authenticate(request: Request, response: Response) {
  const { initData } = request.body
  const params = new URLSearchParams(initData)
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
  const user = JSON.parse(params.get("user") ?? "{}")
  if (String(user.id) !== env.adminId) return response.sendStatus(403)
  response.json(user)
}
