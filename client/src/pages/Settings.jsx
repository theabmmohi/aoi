import { serverlessCall } from "@lib/serverlessCall"
import { useRouteLoaderData } from "react-router"

export function Component() {
  const { settings } = useRouteLoaderData("app")
  return <p>{JSON.stringify(settings, null, 2)}</p>
}
