import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { serverless } from "@/utils/serverless"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TriangleAlert } from "lucide-react"
import { confirm } from "@/utils/confirm"
import { useState } from "react"
import { toast } from "sonner"

export function Component() {
  const [newOwner, setNewOwner] = useState("")
  const [transferring, setTransferring] = useState(false)

  async function transfer() {
    setTransferring(true)
    try {
      if (!(await confirm(`Transfer ownership to ${newOwner}?`))) return toast.error("Transfer cancelled.")
      const { error } = await serverless({ name: "settings", input: { operation: "update", data: { key: "owner", value: Number(newOwner) } } })
      if (error) return toast.error(error.message ?? "Transfer failed.")
      window.Telegram.WebApp.close()
    } finally {
      setTransferring(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <TriangleAlert className="size-4 text-destructive" />
            Transfer ownership
          </CardTitle>
          <CardDescription>Hand this dashboard to another Telegram user. You will lose access right away, and only the new owner can undo it.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <Label htmlFor="new-owner">New owner's Telegram ID</Label>
          <div className="flex gap-2.5">
            <Input id="new-owner" inputMode="numeric" placeholder="6589293488" className="font-mono flex-1" value={newOwner} onChange={(event) => setNewOwner(event.target.value.trim())} />
            <Button type="button" variant="destructive" onClick={transfer} disabled={transferring}>
              Transfer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
