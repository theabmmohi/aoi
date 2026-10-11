import type { ApiError } from "@/lib/types"
import type { ReactNode } from "react"
import { useState, useEffect } from "react"
import { LogIn } from "lucide-react"
import toast from "@/lib/toaster"
import api from "@/lib/api"

export default function login({ error }: { error: ApiError }) {
  const [warn, setWarn] = useState<ReactNode>(<></>)
  useEffect(() => {
    Object.assign(window, {
      onTelegramAuth: (result: { id_token?: string; error?: string }) => {
        if (result.error) toast.error(result.error.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase()))
        if (result.id_token)
          api.post("/auth/login", { token: result.id_token }).then(({ error }) => {
            if (error?.status === 403)
              setWarn(
                <>
                  That Telegram account is not the admin. Sign in with the <b>admin account</b>
                </>
              )
            else if (error) toast.error(error.message)
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
    <div className="flex flex-col items-center gap-5 p-10">
      <div className="rounded-full bg-muted p-5">
        <LogIn size={60} className="text-muted-foreground" />
      </div>
      <p className="font-mono text-center">{error.message}</p>
      <p className="max-w-xs text-center text-muted-foreground">This dashboard is for the admin only. Sign in with the admin Telegram account to continue</p>
      <p className="max-w-xs text-center text-destructive">{warn}</p>
      <button className="tg-auth-button" data-style="shine">
        Sign In with Telegram
      </button>
      <p className="max-w-xs text-center text-destructive">
        Browser sessions last <b>1 hour</b>. Open the dashboard from your bot in Telegram to skip signing in
      </p>
    </div>
  )
}
