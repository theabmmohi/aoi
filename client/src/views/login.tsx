import type { ApiError } from "@/lib/types"
import { useEffect } from "react"
import toast from "@/lib/toaster"
import api from "@/lib/api"

export default function login({ error }: { error: ApiError }) {
  useEffect(() => {
    Object.assign(window, {
      onTelegramAuth: (result: {
        id_token?: string
        error?: string
      }) => {
        if (result.error) toast.error(result.error.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase()))
        if (result.id_token) api.post("/auth/login", { token: result.id_token }).then(({ error }) => {
          if (error) toast.error(error.message)
          else window.location.reload()
        })
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
