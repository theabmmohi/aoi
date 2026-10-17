import { columnFilteringFeature, columnVisibilityFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, filterFn_includesString, globalFilteringFeature, rowPaginationFeature, rowSelectionFeature, rowSortingFeature, sortFn_alphanumeric, sortFn_basic, sortFn_text, tableFeatures, useTable } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { serverlessCall } from "@lib/serverlessCall"
import { toast } from "@lib/toaster"
import { Button } from "@ui/button"
import { Input } from "@ui/input"

// ---------- 1. Features: what the table is allowed to do ----------
const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text }
})

// Kept outside the component so the table gets the same empty list on every render
const noUsers = []
const getRowId = (user) => String(user.id)

// ---------- 2. Small UI helpers ----------
function Check({ checked, indeterminate = false, onChange, label }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate
      }}
      className="size-4 accent-primary"
    />
  )
}

function SortHeader({ column, title }) {
  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown
  return (
    <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting(sorted === "asc")}>
      {title}
      <Icon />
    </Button>
  )
}

const titles = {
  id: "ID",
  first_name: "First name",
  last_name: "Last name",
  username: "Username",
  is_premium: "Premium",
  created_at: "Joined"
}

// ---------- 3. Columns ----------
const helper = createColumnHelper()

function makeColumns({ onDelete }) {
  return helper.columns([
    helper.display({
      id: "select",
      header: ({ table }) => <Check label="Select all on this page" checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onChange={(value) => table.toggleAllPageRowsSelected(value)} />,
      cell: ({ row }) => <Check label="Select row" checked={row.getIsSelected()} onChange={(value) => row.toggleSelected(value)} />,
      enableSorting: false,
      enableHiding: false
    }),
    // ID is always visible: enableHiding false keeps it out of the Columns menu
    helper.accessor("id", {
      header: ({ column }) => <SortHeader column={column} title={titles.id} />,
      sortFn: "basic",
      enableHiding: false
    }),
    helper.accessor("first_name", {
      header: ({ column }) => <SortHeader column={column} title={titles.first_name} />,
      sortFn: "text"
    }),
    // null becomes "" so sorting and searching never meet a null
    helper.accessor((u) => u.last_name ?? "", {
      id: "last_name",
      header: ({ column }) => <SortHeader column={column} title={titles.last_name} />,
      cell: ({ getValue }) => getValue() || "-",
      sortFn: "text"
    }),
    helper.accessor((u) => u.username ?? "", {
      id: "username",
      header: ({ column }) => <SortHeader column={column} title={titles.username} />,
      cell: ({ getValue }) => getValue() || "-",
      sortFn: "text"
    }),
    helper.accessor("is_premium", {
      header: ({ column }) => <SortHeader column={column} title={titles.is_premium} />,
      cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
      sortFn: "basic",
      enableGlobalFilter: false
    }),
    helper.accessor("created_at", {
      header: ({ column }) => <SortHeader column={column} title={titles.created_at} />,
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
      sortFn: "basic",
      enableGlobalFilter: false
    }),
    // The "..." row menu
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
              <DropdownMenuItem variant="destructive" onClick={() => onDelete([row.original.id])}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false
    })
  ])
}

const pageSizes = [5, 10, 20, 50].map((n) => ({ value: String(n), label: `${n} per page` }))

// ---------- 4. The page ----------
export function Component() {
  const [users, setUsers] = useState(null) // null = still loading
  const [error, setError] = useState(null)
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [pageDraft, setPageDraft] = useState(null) // what the page box shows while typing

  useEffect(() => {
    serverlessCall("users")
      .then(setUsers)
      .catch((e) => setError(e.message ?? "Something went wrong"))
  }, [])

  // Deletes on the server first, then removes only the rows that really were deleted
  const onDelete = useCallback(async (ids) => {
    const results = await Promise.allSettled(ids.map((id) => serverlessCall("users", { action: "delete", id })))
    const deleted = ids.filter((_, i) => results[i].status === "fulfilled")
    const failed = results.find((r) => r.status === "rejected")

    if (deleted.length) {
      setUsers((list) => list.filter((x) => !deleted.includes(x.id)))
      setRowSelection({})
      toast.success(deleted.length === 1 ? "User deleted" : `${deleted.length} users deleted`)
    }
    if (failed) toast.error(failed.reason?.message ?? "Delete failed")
  }, [])

  const columns = useMemo(() => makeColumns({ onDelete }), [onDelete])

  const table = useTable({
    features,
    columns,
    data: users ?? noUsers,
    getRowId,
    globalFilterFn: "includesString",
    autoResetPageIndex: false, // keep your page after a delete (we reset it ourselves on search)
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, globalFilter, columnVisibility, rowSelection }
  })

  const { pageIndex, pageSize } = table.state.pagination
  const pageCount = Math.max(table.getPageCount(), 1)
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  // If rows disappear (delete / search), never stay on a page that no longer exists
  useEffect(() => {
    if (pageIndex > pageCount - 1) table.setPageIndex(pageCount - 1)
  }, [pageIndex, pageCount, table])

  // Once the page really changes (arrows, typing a valid page), show the real page number again
  useEffect(() => setPageDraft(null), [pageIndex])

  const goToPage = (text) => {
    setPageDraft(text)
    const n = Number(text)
    if (text !== "" && Number.isInteger(n) && n >= 1 && n <= pageCount) table.setPageIndex(n - 1)
  }

  if (error) return <p className="p-4 text-destructive">{error}</p>
  if (!users) return <p className="p-4 text-muted-foreground">Loading...</p>

  return (
    <div className="space-y-3">
      {/* Search + column visibility */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search name, username, ID..."
          value={globalFilter}
          onChange={(e) => {
            table.setGlobalFilter(e.target.value)
            table.setPageIndex(0)
          }}
          className="min-w-0 flex-1"
        />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Columns <ChevronDown />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                  {titles[column.id]}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Selected count (left) + batch Delete (right), only while something is selected */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            {selectedCount} of {table.getFilteredRowModel().rows.length} row(s) selected
          </span>
          <Button variant="destructive" size="sm" onClick={() => onDelete(table.getFilteredSelectedRowModel().rows.map((r) => r.original.id))}>
            <Trash2 /> Delete ({selectedCount})
          </Button>
        </div>
      )}

      {/* Per page (left) | page x of y (center) | arrows (right) */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
        <div className="flex">
          <Select items={pageSizes} value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
            <SelectTrigger size="sm" aria-label="Rows per page">
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
        <div className="flex items-center justify-center gap-2">
          <Input type="number" inputMode="numeric" min={1} max={pageCount} aria-label="Page number" value={pageDraft ?? pageIndex + 1} onChange={(e) => goToPage(e.target.value)} onBlur={() => setPageDraft(null)} className="h-8 w-14 px-2 text-center" />
          <span className="whitespace-nowrap text-muted-foreground">of {pageCount}</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="icon-sm" aria-label="Previous page" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Next page" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
