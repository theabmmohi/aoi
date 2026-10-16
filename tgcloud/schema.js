import { table, text, json } from "sdk/db"

export const settings = table("settings", {
  key: text("key").primaryKey(),
  value: json("value")
})
