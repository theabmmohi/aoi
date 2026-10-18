import { getSetting } from "../db/settings.js"
import { EndpointError } from "sdk"

export const authenticate = (fn) => async (input, ctx) => {
  const user = ctx.initData.user
  const owner = await getSetting({ key: "owner" })
  if (owner !== user.id) throw new EndpointError("You do not have access to this Dash.")
  return fn(input, { ...ctx, owner: user })
}
