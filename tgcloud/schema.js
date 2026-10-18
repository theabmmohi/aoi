import { table, text, json, integer, boolean, index, sql } from "sdk/db"

export const settings = table("settings", { key: text("key").primaryKey(), value: json("value") })

export const users = table(
  "users",
  {
    id: integer("id").primaryKey(),
    first_name: text("first_name").notNull(),
    last_name: text("last_name"),
    username: text("username"),
    is_premium: boolean("is_premium").default(false),
    created_at: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
  },
  (table) => ({
    usernameIdx: index("idx_users_username").on(table.username)
  })
)
