import { settings } from "../../schema.js"
import { db, EndpointError } from "sdk"
import { eq } from "sdk/db"

export const authenticate = (fn) => async (input, ctx) => {
  const user = ctx.initData.user
  const owner = (await db.select().from(settings).where(eq(settings.key, key)).get())?.value
  if (owner !== user.id) throw new EndpointError("You do not have access to this Dash.")
  return fn(input, { ...ctx, owner: user })
}
