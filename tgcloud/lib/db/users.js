import { users } from "../../schema.js"
import { eq } from "sdk/db"
import { db } from "sdk"

function filter(data) {
  const user = {}
  if ("first_name" in data) user.first_name = data.first_name ?? "null"
  if ("last_name" in data) user.last_name = data.last_name ?? null
  if ("username" in data) user.username = data.username ?? null
  if ("is_premium" in data) user.is_premium = !!data.is_premium
  return user
}

export async function getUser({ id }) {
  const row = await db.select().from(users).where(eq(users.id, id)).get()
  return row ?? null
}

export async function setUser({ id, user }) {
  await db
    .insert(users)
    .values({ id, ...filter(user) })
    .onConflictDoUpdate({
      target: users.id,
      set: filter(user)
    })
    .run()
  return getUser({ id })
}

export async function delUser({ id }) {
  await db.delete(users).where(eq(users.id, id)).run()
}

export async function newUser({ id, user }) {
  await db
    .insert(users)
    .values({ id, ...filter(user) })
    .onConflictDoNothing({
      target: users.id
    })
    .run()
  return getUser({ id })
}
