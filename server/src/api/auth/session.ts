import type { Request } from "express"
import { SignJWT, jwtVerify } from "jose"
import { createHmac } from "node:crypto"
import env from "@/env"

const key = createHmac("sha256", env.secret).update("user").digest()

export interface User {
  id: number
  name: string
  username?: string
  photo_url?: string
}

export function issue(user: User): Promise<string> {
  return new SignJWT({ ...user }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("1h").sign(key)
}

export async function read(request: Request): Promise<User | null> {
  const token = request.header("cookie")?.match(/(?:^|; )user=([^;]+)/)?.[1]
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] })
    return payload as unknown as User
  } catch {
    return null
  }
}
