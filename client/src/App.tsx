import AppLayout from "@/layout/AppLayout"

export default function App() {
  return (
    <AppLayout>
      <pre className="overflow-auto">{JSON.stringify(window.Telegram, null, 2)}</pre>
    </AppLayout>
  )
}
