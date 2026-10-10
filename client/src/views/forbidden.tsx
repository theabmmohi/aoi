import type { ApiError } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { OctagonMinus } from "lucide-react"

export default function forbidden({ error }: { error: ApiError }) {
  const close = () => window.Telegram.WebApp.close()
  return (
    <div className="flex flex-col items-center gap-5 px-10 py-20">
      <div className="rounded-full bg-muted p-5">
        <OctagonMinus size={60} className="text-destructive" />
      </div>
      <p className="font-mono text-center">{error.message}</p>
      <p className="text-muted-foreground">You dont have access to this resource</p>
      <Button size="lg" onClick={close}>
        Close
      </Button>
    </div>
  )
}
