import type { ApiError } from "@/lib/types"

export default function login({error}: {error: ApiError}) {
  return <p>Login: {JSON.stringify(error, null, 2)}</p>
}
