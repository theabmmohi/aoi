import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@ui/alert-dialog"
import { columnFilteringFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, filterFn_includesString, globalFilteringFeature, rowPaginationFeature, rowSortingFeature, sortFn_alphanumeric, sortFn_basic, sortFn_text, tableFeatures, useTable } from "@tanstack/react-table"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table"
import { ArrowUpDown, MoreHorizontal, Plus, Trash2, TriangleAlert } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useFetcher, useRouteLoaderData } from "react-router"
import { serverlessCall } from "@lib/serverlessCall"
import { Field, FieldGroup } from "@ui/field"
import { Button } from "@ui/button"
import { Label } from "@ui/label"
import { Input } from "@ui/input"

export async function action({ request }) {
  const { operation, data } = await request.json()
  await serverlessCall("settings", { operation, data })
  return { ok: true }
}

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text }
})

const getRowId = (setting) => setting.key
const titleOf = (column) => column.columnDef.meta.title

function SortHeader({ column }) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
      {titleOf(column)}
      <ArrowUpDown />
    </Button>
  )
}

const chevronSpin = "[&_svg]:transition-[rotate] [&_svg]:duration-300 [&_svg]:[rotate:var(--chevron,0deg)] motion-reduce:[&_svg]:transition-none"

function useChevronFlip() {
  const [angle, setAngle] = useState(0)
  return {
    style: { "--chevron": `${angle}deg` },
    onOpenChange: (open) => setAngle(open ? (Math.random() < 0.5 ? 180 : -180) : 0)
  }
}

const show = (value) => (typeof value === "string" ? value : JSON.stringify(value))

function parseNew(text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function parseEdit(text, original) {
  if (typeof original === "string") return text === "" ? { error: "The value can't be empty." } : { value: text }
  try {
    return { value: JSON.parse(text) }
  } catch {
    return { error: "Enter valid JSON, like 42, true or null." }
  }
}

const helper = createColumnHelper()

function makeColumns({ onEdit, onDelete }) {
  return helper.columns([
    helper.accessor("key", {
      meta: { title: "Key" },
      header: ({ column }) => <SortHeader column={column} />,
      cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
      sortFn: "text"
    }),
    helper.accessor((setting) => show(setting.value), {
      id: "value",
      meta: { title: "Value" },
      header: ({ column }) => <SortHeader column={column} />,
      cell: ({ getValue }) => (
        <span className="block max-w-40 truncate" title={getValue()}>
          {getValue()}
        </span>
      ),
      sortFn: "text"
    }),
    helper.display({
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Open menu" />}>
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    })
  ])
}

const pageSizes = [10, 20, 50].map((n) => ({
  value: String(n),
  label: (
    <>
      <span className="font-mono">{n}</span> per page
    </>
  )
}))

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

function AddDialog({ open, keys, onClose }) {
  const { busy, run } = useMutation(onClose)
  const [key, setKey] = useState("")
  const [value, setValue] = useState("")

  const name = key.trim()
  const problem = name === "owner" ? "The owner key is reserved, use Transfer ownership." : keys.includes(name) ? "This key already exists." : ""
  const valid = name !== "" && value.trim() !== "" && !problem

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="sm:max-w-sm" showCloseButton={!busy}>
        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (valid) run("create", { key: name, value: parseNew(value) })
          }}
        >
          <DialogHeader>
            <DialogTitle>Add setting</DialogTitle>
            <DialogDescription>Create a new key with its value.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="add-key">Key</Label>
              <Input id="add-key" value={key} onChange={(e) => setKey(e.target.value)} disabled={busy} autoComplete="off" className="font-mono" />
              {problem && <p className="text-sm text-destructive">{problem}</p>}
            </Field>
            <Field>
              <Label htmlFor="add-value">Value</Label>
              <Input id="add-value" value={value} onChange={(e) => setValue(e.target.value)} disabled={busy} autoComplete="off" />
              <p className="text-xs text-muted-foreground">Numbers, true/false, null and JSON keep their type. Anything else is saved as text.</p>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose disabled={busy} render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" processing={busy} disabled={!valid}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditDialog({ open, row, onClose }) {
  const { busy, run } = useMutation(onClose)
  const [value, setValue] = useState(show(row.value))

  const parsed = parseEdit(value, row.value)
  const changed = !parsed.error && JSON.stringify(parsed.value) !== JSON.stringify(row.value)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="sm:max-w-sm" showCloseButton={!busy}>
        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (changed) run("update", { key: row.key, value: parsed.value })
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit setting</DialogTitle>
            <DialogDescription>Only the value can be changed.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="edit-key">Key</Label>
              <Input id="edit-key" value={row.key} disabled readOnly className="font-mono" />
            </Field>
            <Field>
              <Label htmlFor="edit-value">Value</Label>
              <Input id="edit-value" value={value} onChange={(e) => setValue(e.target.value)} disabled={busy} autoComplete="off" />
              {parsed.error && <p className="text-sm text-destructive">{parsed.error}</p>}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose disabled={busy} render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" processing={busy} disabled={!changed}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({ open, row, onClose }) {
  const { busy, run } = useMutation(onClose)

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this setting?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the key and its value. <span className="text-destructive">It can't be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <dl className="grid gap-1 rounded-2xl border bg-muted/40 p-3 font-mono text-xs break-all">
          <div>
            <dt className="inline text-muted-foreground">key: </dt>
            <dd className="inline text-destructive">{row.key}</dd>
          </div>
          <div>
            <dt className="inline text-muted-foreground">value: </dt>
            <dd className="inline text-destructive">{show(row.value)}</dd>
          </div>
        </dl>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" processing={busy} onClick={() => run("delete", { key: row.key })}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
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
  const rows = useMemo(() => settings.filter((setting) => setting.key !== "owner"), [settings])
  const keys = useMemo(() => settings.map((setting) => setting.key), [settings])

  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [dialog, setDialog] = useState({ type: null, row: null, open: false, n: 0 })
  const pageFlip = useChevronFlip()

  const openDialog = useCallback((type, row = null) => setDialog((d) => ({ type, row, open: true, n: d.n + 1 })), [])
  const close = useCallback(() => setDialog((d) => ({ ...d, open: false })), [])
  const columns = useMemo(() => makeColumns({ onEdit: (row) => openDialog("edit", row), onDelete: (row) => openDialog("delete", row) }), [openDialog])

  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId,
    globalFilterFn: "includesString",
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter }
  })

  const { pageIndex, pageSize } = table.state.pagination

  return (
    <div className="space-y-3">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Owner</p>
          <p className="truncate font-medium">{[me.first_name, me.last_name].filter(Boolean).join(" ") || "Owner"}</p>
          <p className="font-mono text-xs text-muted-foreground">{owner}</p>
        </div>
        <Button variant="destructive" size="sm" onClick={() => openDialog("transfer")}>
          Transfer ownership
        </Button>
      </section>

      <div className="flex items-center gap-2">
        <Input placeholder="Search key or value..." value={globalFilter} onChange={(e) => table.setGlobalFilter(e.target.value)} className="min-w-0 flex-1" />
        <Button onClick={() => openDialog("add")}>
          <Plus /> Add
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllLeafColumns().length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
        <div className="flex">
          <Select items={pageSizes} value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))} onOpenChange={pageFlip.onOpenChange}>
            <SelectTrigger size="sm" aria-label="Rows per page" className={chevronSpin} style={pageFlip.style}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-center whitespace-nowrap text-muted-foreground">
          {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="font-mono" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Prev
          </Button>
          <Button variant="outline" size="sm" className="font-mono" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      {dialog.type === "add" && <AddDialog key={dialog.n} open={dialog.open} keys={keys} onClose={close} />}
      {dialog.type === "edit" && <EditDialog key={dialog.n} open={dialog.open} row={dialog.row} onClose={close} />}
      {dialog.type === "delete" && <DeleteDialog key={dialog.n} open={dialog.open} row={dialog.row} onClose={close} />}
      {dialog.type === "transfer" && <TransferDialog key={dialog.n} open={dialog.open} owner={owner} onClose={close} />}
    </div>
  )
}
