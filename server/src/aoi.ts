import { Bot, webhookCallback } from "grammy"
import { getHost } from "@/function"
import start from "@/command/start"
import server from "@/server"
import env from "@/env"

const aoi = new Bot(env.botToken)

aoi.command("start", start)

server.post("/", webhookCallback(aoi, "express", { secretToken: env.secret }))
server.listen(env.port, async () => {
  await aoi.api.setWebhook(getHost(), { secret_token: env.secret })
  await aoi.init()
  const { url } = await aoi.api.getWebhookInfo()
  const { first_name, username } = aoi.botInfo
  console.log(
    [
      `Hi Im ${first_name}`,
      `Find me at https://t.me/${username}`,
      `And Im webhooked at ${url}`
    ].join("\n")
  )
})
