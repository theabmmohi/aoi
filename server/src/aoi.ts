import { Bot, webhookCallback } from "grammy"
import server from "@/server"
import env from "@/env"

const aoi = new Bot(env.botToken)

aoi.command("start", (ctx) => ctx.reply("hi"))

server.post("/", webhookCallback(aoi, "express", { secretToken: env.secret }))
server.listen(env.port, async () => {
  await aoi.api.setWebhook(env.host, { secret_token: env.secret })
  await aoi.init()
  const { url } = await aoi.api.getWebhookInfo()
  const { first_name, username } = await aoi.botInfo
  console.log(
    [
      `Hi Im ${first_name}`,
      `Find me at https://t.me/${username}`,
      `And Im webhooked at ${url}`
    ].join("\n")
  )
})
