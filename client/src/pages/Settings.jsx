import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@ui/alert-dialog"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ui/dialog"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@ui/combobox"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useFetcher, useRouteLoaderData } from "react-router"
import { serverlessCall } from "@lib/serverlessCall"
import { Field, FieldGroup } from "@ui/field"
import { TriangleAlert } from "lucide-react"
import { toast } from "@lib/toaster"
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
    pending: fetcher.state !== "idle" ? fetcher.json?.data?.value : undefined,
    run: (operation, data) => fetcher.submit({ operation, data }, { method: "post", action: "/settings", encType: "application/json" })
  }
}

function offsetOf(zone) {
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "shortOffset" }).formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value ?? ""
  } catch {
    return ""
  }
}

const label = (zone) => zone.replaceAll("_", " ")
const zoneList = (current) => [...new Set(["UTC", current, ...(Intl.supportedValuesOf?.("timeZone") ?? [])])].sort()

function TimezoneSelect({ value }) {
  const onDone = useCallback(() => toast.success("Timezone updated."), [])
  const { busy, run, pending } = useMutation(onDone)
  const zones = useMemo(() => zoneList(value), [value])
  const offsets = useMemo(() => Object.fromEntries(zones.map((zone) => [zone, offsetOf(zone)])), [zones])

  return (
    <Combobox
      items={zones}
      value={pending ?? value}
      disabled={busy}
      itemToStringLabel={label}
      onValueChange={(next) => {
        if (!next || next === value) return
        run("update", { key: "timezone", value: next })
      }}
    >
      <ComboboxInput
        placeholder="Search city or region..."
        aria-label="Timezone"
        disabled={busy}
        onFocus={(event) => {
          const field = event.currentTarget
          requestAnimationFrame(() => field.select())
        }}
      />
      <ComboboxContent>
        <ComboboxEmpty>No timezones found.</ComboboxEmpty>
        <ComboboxList>
          {(zone) => (
            <ComboboxItem key={zone} value={zone}>
              {label(zone)}
              <span className="ml-auto font-mono text-xs text-muted-foreground">{offsets[zone]}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function TransferDialog({ open, owner, onClose }) {
  const onDone = useCallback(() => {
    onClose()
    window.Telegram?.WebApp?.close()
  }, [onClose])
  const { busy, run } = useMutation(onDone)
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
  const { owner, timezone } = settings
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
      <section className="grid gap-2 rounded-xl border p-3">
        <div>
          <p className="text-xs text-muted-foreground">Timezone</p>
          <p className="text-sm text-muted-foreground">Dates and times in the dashboard use this zone.</p>
        </div>
        <TimezoneSelect value={timezone} />
      </section>
      {transfer.n > 0 && <TransferDialog key={transfer.n} open={transfer.open} owner={owner} onClose={closeTransfer} />}
    </div>
  )
}
