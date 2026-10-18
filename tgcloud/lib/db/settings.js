import { settings } from "../../schema.js"
import { eq } from "sdk/db"
import { db } from "sdk"

export async function getSetting({ key }) {
  const row = await db.select().from(settings).where(eq(settings.key, key)).get()
  return row ? row : null
}

export async function setSetting({key, value}) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value }
    })
    .run()
  return getSetting({key})
}

export async function delSetting({key}) {
  await db.delete(settings).where(eq(settings.key, key)).run()
}

export async function newSetting({key, value}) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoNothing({
      target: settings.key
    })
    .run()
  return getSetting({key})
}
