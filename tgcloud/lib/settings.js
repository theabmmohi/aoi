import { db } from "sdk"
import { eq } from "sdk/db"
import { settings } from "../schema.js"

export async function getSetting(key, fallback = null) {
  const row = await db.select().from(settings).where(eq(settings.key, key)).get()
  return row ? row.value : fallback
}

export async function setSetting(key, value) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value }
    })
    .run()
}

export async function delSetting(key) {
  await db.delete(settings).where(eq(settings.key, key)).run()
}
