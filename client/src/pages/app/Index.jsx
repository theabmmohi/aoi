import { useRouteLoaderData } from "react-router"

export function Component() {
  const me = useRouteLoaderData("app")

  return <pre>{me}</pre>
}
