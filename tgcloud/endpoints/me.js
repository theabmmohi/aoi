import { getSetting } from "../lib/db/settings.js"
import { EndpointError } from "sdk"

export default async function (_, ctx) {
  const owner = await getSetting("owner")
  if (owner !== ctx.initData.user.id) throw new EndpointError("You do not have access to this Dash.")
  return ctx.initData.user
}
