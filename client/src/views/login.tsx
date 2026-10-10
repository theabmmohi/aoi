import type { ApiError } from "@/lib/types"

export default function login({error}: {error: ApiError}) {
  return <div>
    {error.status}: {error.message}
    <button className="tg-auth-button" data-style="shine">Sign In with Telegram</button>
  </div>
}
