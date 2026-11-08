import { useCallback, useEffect, useRef, useState } from "react"

// TGCloud adds this to Telegram.WebApp; it isn't in Telegram's own API or @types/telegram-web-app.
type Bridge = { Serverless: { call(name: string, input: unknown, cb: (error: unknown, data: unknown) => void): void } }

type Settled<T> = { key: string; data: T | null; error: ServerlessError | null }
type Options<I> = { name: string; input?: I }

export type Result<T> = { data: T; error: null } | { data: null; error: ServerlessError }
export type ServerlessError = {
  name?: string
  status?: number
  type?: string
  message?: string
}

function call<T = unknown, I = unknown>({ name, input }: Options<I>): Promise<Result<T>> {
  const app = window.Telegram?.WebApp
  if (!app?.initData) return Promise.resolve({ data: null, error: { type: "NOT_TELEGRAM", message: "Open this app inside Telegram." } })
  return new Promise((resolve) => {
    try {
      ;(app as unknown as Bridge).Serverless.call(name, input ?? {}, (error, data) => {
        if (error) resolve({ data: null, error: error as ServerlessError })
        else resolve({ data: data as T, error: null })
      })
    } catch (e) {
      resolve({ data: null, error: { type: "CLIENT", message: e instanceof Error ? e.message : String(e) } })
    }
  })
}

function use<T = unknown, I = unknown>({ name, input, lazy = false }: Options<I> & { lazy?: boolean }) {
  const [settled, setSettled] = useState<Settled<T> | null>(null)
  const [busy, setBusy] = useState(false)
  const latest = useRef(0)
  const inputKey = JSON.stringify(input ?? null)
  const key = `${name}:${inputKey}`
  const run = useCallback(
    async (override?: I) => {
      const id = ++latest.current
      setBusy(true)
      const result = await call<T, I>({ name, input: override ?? (JSON.parse(inputKey) as I) })
      if (id === latest.current) {
        setSettled({ key, data: result.data, error: result.error })
        setBusy(false)
      }
      return result
    },
    [name, inputKey, key]
  )
  useEffect(() => {
    if (lazy) return
    let cancelled = false
    void call<T, I>({ name, input: JSON.parse(inputKey) as I }).then((result) => {
      if (!cancelled) setSettled({ key, data: result.data, error: result.error })
    })
    return () => {
      cancelled = true
    }
  }, [lazy, name, inputKey, key])
  const loading = busy || (!lazy && settled?.key !== key)
  return { data: settled?.data ?? null, error: settled?.error ?? null, loading, run }
}

export const serverless = Object.assign(call, { use })

// This file is written by Claude, I don't understand a single line of this file :)
