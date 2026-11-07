import { useRouteError } from "react-router"

export function ErrorBoundary() {
  const error = useRouteError()
  return (
    <div className="overflow-x-hidden p-5">
      <code>{error.message}</code>
      <pre className="overflow-x-auto border p-2.5">{JSON.stringify(error, null, 2)}</pre>
    </div>
  )
}
