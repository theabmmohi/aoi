import { users } from "../../schema.js"
import { eq } from "sdk/db"
import { db } from "sdk"

function pick(u) {
  const data = {}
  if ("first_name" in u) data.first_name = u.first_name
  if ("last_name" in u || "first_name" in u) data.last_name = u.last_name ?? null
  if ("username" in u || "first_name" in u) data.username = u.username ?? null
  if ("language_code" in u || "first_name" in u) data.language_code = u.language_code ?? null
  if ("is_premium" in u || "first_name" in u) data.is_premium = !!u.is_premium
  if ("blocked" in u) data.blocked = !!u.blocked
  return data
}

export async function getUser(id) {
  const row = await db.select().from(users).where(eq(users.id, id)).get()
  return row ?? null
}

export async function setUser(id, u) {
  const data = pick(u)
  await db
    .insert(users)
    .values({ id, ...data })
    .onConflictDoUpdate({
      target: users.id,
      set: data
    })
    .run()
  return getUser(id)
}

export async function delUser(id) {
  await db.delete(users).where(eq(users.id, id)).run()
}

export async function newUser(id, u) {
  await db
    .insert(users)
    .values({ id, ...pick(u) })
    .onConflictDoNothing({
      target: users.id
    })
    .run()
  return getUser(id)
}
