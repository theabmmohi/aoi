import { createRemoteJWKSet, jwtVerify } from "jose"
import { issue } from "@/api/auth/session"
import { Router } from "express"
import env from "@/env"

const login = Router()
const keys = createRemoteJWKSet(new URL("https://oauth.telegram.org/.well-known/jwks.json"))

login.post("/", async (request, response) => {
  try {
    const { payload } = await jwtVerify(String(request.body?.token ?? ""), keys, {
      issuer: "https://oauth.telegram.org",
      audience: env.botToken.split(":")[0] ?? "",
      algorithms: ["RS256"]
    })
    if (String(payload.id) !== env.adminId) return response.sendStatus(403)

    const token = await issue({
      id: Number(payload.id),
      name: String(payload.name),
      username: payload.preferred_username ? String(payload.preferred_username) : undefined,
      photo_url: payload.picture ? String(payload.picture) : undefined
    })
    response.cookie("user", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    response.sendStatus(204)
  } catch {
    response.sendStatus(401)
  }
})

export default login
