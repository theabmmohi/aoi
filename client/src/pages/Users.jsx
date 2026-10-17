import { serverlessCall } from "@lib/serverlessCall"
import { useEffect, useState } from "react"

export function Component() {
  const [users, setusers] = useState(null)
  useEffect(() => {
    serverlessCall("users").then((u) => setusers(u))
  }, [])

  return <pre className="overflow-x-auto">{JSON.stringify(users, null, 2)}</pre>
}
