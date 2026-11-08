function biometric(reason: string) {
  return new Promise<boolean | null>((resolve) => {
    const app = window.Telegram?.WebApp
    const bm = app?.BiometricManager
    if (!app || !bm || !app.isVersionAtLeast("7.2")) return resolve(null)
    const text = reason.slice(0, 128)
    bm.init(() => {
      if (!bm.isBiometricAvailable) return resolve(null)
      const authenticate = () => bm.authenticate({ reason: text }, resolve)
      if (bm.isAccessGranted) authenticate()
      else bm.requestAccess({ reason: text }, (granted) => (granted ? authenticate() : resolve(null)))
    })
  })
}

function native(message: string) {
  return new Promise<boolean>((resolve) => {
    const app = window.Telegram?.WebApp
    if (app?.showConfirm) app.showConfirm(message, resolve)
    else resolve(window.confirm(message))
  })
}

export const confirm = async (reason: string) => (await biometric(reason)) ?? (await native(reason))
