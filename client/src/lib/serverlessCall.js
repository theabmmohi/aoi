export function serverlessCall(name = "", input = {}) {
  if (!window.Telegram?.WebApp?.initData) throw new Error("Cannot call serverless endpoint outside Telegram.")
  return new Promise((resolve, reject) => {
    window.Telegram.WebApp.Serverless.call(name, input, (error, data) => {
      if (error) reject(error)
      else resolve(data)
    })
  })
}
