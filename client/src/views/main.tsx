import type { User } from "@/lib/types"

export default function main({ user }: { user: User }) {
  return <p>{JSON.stringify(user, null, 2)}</p>
}
