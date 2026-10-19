import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@ui/alert-dialog"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ui/dialog"
import { useFetcher, useRouteLoaderData } from "react-router"
import { useCallback, useEffect, useState } from "react"
import { serverlessCall } from "@lib/serverlessCall"
import { Field, FieldGroup } from "@ui/field"
import { TriangleAlert } from "lucide-react"
import { Button } from "@ui/button"
import { Label } from "@ui/label"
import { Input } from "@ui/input"

export async function action({ request }) {
  const { operation, data } = await request.json()
  await serverlessCall("settings", { operation, data })
  return { ok: true }
}

function useMutation(onDone) {
  const fetcher = useFetcher()
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) onDone()
  }, [fetcher.state, fetcher.data, onDone])
  return {
    busy: fetcher.state !== "idle",
    run: (operation, data) => fetcher.submit({ operation, data }, { method: "post", action: "/settings", encType: "application/json" })
  }
}

function TransferDialog({ open, owner, onClose }) {
  const { busy, run } = useMutation(onClose)
  const [step, setStep] = useState("id")
  const [id, setId] = useState("")

  const valid = /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0 && Number(id) !== owner
  const problem = id === "" || valid ? "" : Number(id) === owner ? "That user is already the owner." : "Enter a numeric Telegram user ID."

  return (
    <>
      <Dialog open={open && step === "id"} onOpenChange={(next) => !next && onClose()}>
        <DialogContent className="sm:max-w-sm">
          <form
            className="grid gap-6"
            onSubmit={(event) => {
              event.preventDefault()
              if (valid) setStep("confirm")
            }}
          >
            <DialogHeader>
              <DialogTitle>Transfer ownership</DialogTitle>
              <DialogDescription>Enter the Telegram user ID of the new owner.</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <Label htmlFor="transfer-id">New owner ID</Label>
                <Input id="transfer-id" value={id} onChange={(e) => setId(e.target.value.trim())} inputMode="numeric" autoComplete="off" className="font-mono" />
                {problem && <p className="text-sm text-destructive">{problem}</p>}
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" disabled={!valid}>
                Continue
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={open && step === "confirm"} onOpenChange={(next) => !next && !busy && setStep("id")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlert />
            </AlertDialogMedia>
            <AlertDialogTitle>Transfer ownership?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-mono font-medium text-foreground">{id}</span> will become the owner. <span className="text-destructive">You will lose access to this dashboard right away, and only the new owner can undo this.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Back</AlertDialogCancel>
            <AlertDialogAction variant="destructive" processing={busy} onClick={() => run("update", { key: "owner", value: Number(id) })}>
              Transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function Component() {
  const { me, settings } = useRouteLoaderData("app")
  const owner = settings.find((setting) => setting.key === "owner")?.value
  const [transfer, setTransfer] = useState({ open: false, n: 0 })
  const closeTransfer = useCallback(() => setTransfer((t) => (t.open ? { ...t, open: false } : t)), [])

  return (
    <div className="space-y-3">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Owner</p>
          <p className="truncate font-medium">{[me.first_name, me.last_name].filter(Boolean).join(" ") || "Owner"}</p>
          <p className="font-mono text-xs text-muted-foreground">{owner}</p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setTransfer((t) => ({ open: true, n: t.n + 1 }))}>
          Transfer ownership
        </Button>
      </section>
      {transfer.n > 0 && <TransferDialog key={transfer.n} open={transfer.open} owner={owner} onClose={closeTransfer} />}
    </div>
  )
}
