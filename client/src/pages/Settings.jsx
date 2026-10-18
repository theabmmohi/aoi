import { serverlessCall } from "@lib/serverlessCall"
import { useLoaderData } from "react-router"

export async function loader() {
  const [settings] = await Promise.all([serverlessCall("settings")])
  return { settings }
}

export function Component() {
  const { settings } = useLoaderData()
  return <p>{JSON.stringify(settings, null, 2)}</p>
}
