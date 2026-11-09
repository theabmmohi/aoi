import type { BiometricManager } from "telegram-web-app"
import { toast } from "sonner"

const app = window.Telegram.WebApp

const refresh = () => (window.Telegram as unknown as { WebView: { postEvent(type: string): void } }).WebView.postEvent("web_app_biometry_get_info")

function sync(bm: BiometricManager) {
  return new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(timer)
      app.offEvent("biometricManagerUpdated", done)
      resolve()
    }
    const timer = setTimeout(done, 2000)
    app.onEvent("biometricManagerUpdated", done)
    if (bm.isInited) refresh()
    else bm.init(done)
  })
}

function ensureAccess(bm: BiometricManager, reason: string) {
  if (bm.isAccessGranted) return Promise.resolve(true)
  return new Promise<boolean>((resolve) => {
    const declined = bm.isAccessRequested
    let acted = false
    toast(declined ? "Biometrics access is turned off." : "Allow biometrics access to confirm this action?", {
      id: "biometric-access",
      duration: Infinity,
      onDismiss: () => !acted && resolve(false),
      action: {
        label: declined ? "Settings" : "Allow",
        onClick: () => {
          acted = true
          if (!declined) return bm.requestAccess({ reason }, resolve)
          bm.openSettings()
          resolve(false)
        }
      }
    })
  })
}

function authenticate(bm: BiometricManager, reason: string) {
  return new Promise<boolean>((resolve) => {
    try {
      bm.authenticate({ reason }, resolve)
    } catch {
      resolve(false)
    }
  })
}

function native(reason: string) {
  return new Promise<boolean>((resolve) => {
    if (app.isVersionAtLeast("6.2")) app.showConfirm(reason, resolve)
    else resolve(window.confirm(reason))
  })
}

export async function confirm(reason: string) {
  const bm = app.BiometricManager
  if (bm && app.isVersionAtLeast("7.2")) {
    await sync(bm)
    if (bm.isBiometricAvailable) return (await ensureAccess(bm, reason)) && (await authenticate(bm, reason))
  }
  return native(reason)
}
