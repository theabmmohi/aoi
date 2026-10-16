import { getSetting } from "../lib/settings.js"
import { EndpointError } from "sdk"

export default async function (_, ctx) {
  const owner = await getSetting("owner")
  if (owner !== ctx.initData.user.id)
    throw new EndpointError("Forbidden: You are not an owner.", {
      code: "FORBIDDEN"
    })
  return
}
