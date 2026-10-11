import type { User, ApiError } from "@/lib/types"
import type { ReactNode } from "react"
import { Suspense, lazy, useState, useEffect } from "react"
import AppLayout from "@/layout/appLayout"
import api from "@/lib/api"

const Dash = lazy(() => import("@/views/dash"))
const Login = lazy(() => import("@/views/login"))
const Forbidden = lazy(() => import("@/views/forbidden"))

export default function app() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  useEffect(() => {
    api.get<User>("/auth/me").then(({ data: user, error }) => {
      setUser(user)
      setError(error)
    })
  }, [])
  let View: ReactNode
  if (!user && !error) View = <></>
  if (user) View = <Dash user={user} />
  if (error) View = error.status == 403 ? <Forbidden error={error} /> : <Login error={error} />
  return (
    <AppLayout>
      <Suspense>{View}</Suspense>
    </AppLayout>
  )
}
