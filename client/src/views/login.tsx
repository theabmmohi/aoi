import type { ApiError } from "@/lib/types"
import { useEffect } from "react"

export default function login({ error }: { error: ApiError }) {
  useEffect(() => {
    Object.assign(window, {
      onTelegramAuth: (result: {
        user?: { id?: number }
        error?: string
      }) => {
        console.log(result)
      }
    })
    if (!document.getElementById("telegram-login")) {
      const script = document.createElement("script")
      script.id = "telegram-login"
      script.src = "https://oauth.telegram.org/js/telegram-login.js?6"
      script.dataset.onauth = "window.onTelegramAuth?.(data)"
      script.dataset.clientId = import.meta.env.VITE_TELEGRAM_CLIENT_ID
      document.head.appendChild(script)
    }
    return () => void Reflect.deleteProperty(window, "onTelegramAuth")
  }, [])
  return (
    <div>
      {error.status}: {error.message}
      <button className="tg-auth-button" data-style="shine">
        Sign In with Telegram
      </button>
    </div>
  )
}
