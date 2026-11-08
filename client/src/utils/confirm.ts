const app = window.Telegram.WebApp

function biometric(reason: string) {
  return new Promise<boolean | null>((resolve) => {
    const bm = app.BiometricManager
    if (!bm || !app.isVersionAtLeast("7.2")) return resolve(null)
    const run = () => {
      try {
        if (!bm.isBiometricAvailable) return resolve(null)
        const authenticate = () => bm.authenticate({ reason }, resolve)
        if (bm.isAccessGranted) return authenticate()
        if (bm.isAccessRequested) return resolve(null)
        bm.requestAccess({ reason }, (granted) => (granted ? authenticate() : resolve(null)))
      } catch {
        resolve(null)
      }
    }
    if (bm.isInited) run()
    else bm.init(run)
  })
}

function native(reason: string) {
  return new Promise<boolean>((resolve) => {
    if (app.showConfirm) app.showConfirm(reason, resolve)
    else resolve(window.confirm(reason))
  })
}

export const confirm = async (reason: string) => (await biometric(reason)) ?? (await native(reason))
