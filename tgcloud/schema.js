import { table, text, json, integer, boolean, index, sql } from "sdk/db"

export const settings = table("settings", {
  key: text("key").primaryKey(),
  value: json("value")
})

export const users = table(
  "users",
  {
    id: integer("id").primaryKey(),
    first_name: text("first_name").notNull(),
    last_name: text("last_name"),
    username: text("username"),
    language_code: text("language_code"),
    is_premium: boolean("is_premium").default(false),
    blocked: boolean("blocked").default(false),
    created_at: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
    last_seen_at: integer("last_seen_at", { mode: "timestamp" }).default(sql`(unixepoch())`)
  },
  (t) => ({
    usernameIdx: index("idx_users_username").on(t.username)
  })
)
