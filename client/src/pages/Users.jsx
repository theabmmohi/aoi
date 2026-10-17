import { columnFilteringFeature, columnVisibilityFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, filterFn_includesString, globalFilteringFeature, rowPaginationFeature, rowSelectionFeature, rowSortingFeature, sortFn_alphanumeric, sortFn_basic, sortFn_text, tableFeatures, useTable } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
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

// ---------- 2. Mock data: 50 users, same shape as the `users` endpoint ----------
const firstNames = ["Aiko", "Ren", "Sora", "Hana", "Kenji", "Yuki", "Mika", "Daiki", "Rin", "Takumi"]
const lastNames = ["Sato", "Tanaka", "Mori", "Ito", "Kato", "Abe", "Ono", "Endo", "Hara", "Kimura"]

function makeUsers(count) {
  let seed = 7
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const pick = (list) => list[Math.floor(rand() * list.length)]
  const start = Date.UTC(2026, 0, 1)

  return Array.from({ length: count }, (_, i) => {
    const first_name = pick(firstNames)
    const last_name = rand() < 0.2 ? null : pick(lastNames)
    return {
      id: 5_000_000_000 + i * 70_000_000 + Math.floor(rand() * 60_000_000),
      first_name,
      last_name,
      username: rand() < 0.15 ? null : `${first_name}${last_name ?? ""}${i}`.toLowerCase(),
      is_premium: rand() < 0.2,
      blocked: rand() < 0.15,
      created_at: start + Math.floor(rand() * 290) * 86_400_000 + Math.floor(rand() * 86_400_000)
    }
  })
}

const mockUsers = makeUsers(50)
const getRowId = (user) => String(user.id)
const fullName = (u) => [u.first_name, u.last_name].filter(Boolean).join(" ")

// ---------- 3. Small UI helpers ----------
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
  blocked: "Blocked",
  created_at: "Joined"
}

// ---------- 4. Columns ----------
const helper = createColumnHelper()

function makeColumns({ onEdit, onDelete, onUpdate }) {
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
      cell: ({ getValue }) => (getValue() ? `@${getValue()}` : "-"),
      sortFn: "text"
    }),
    helper.accessor("is_premium", {
      header: ({ column }) => <SortHeader column={column} title={titles.is_premium} />,
      cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
      sortFn: "basic",
      enableGlobalFilter: false
    }),
    helper.accessor("blocked", {
      header: ({ column }) => <SortHeader column={column} title={titles.blocked} />,
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
              <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete([row.original.id])}>
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate(row.original)}>Update</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false
    })
  ])
}

const pageSizes = [5, 10, 20, 50].map((n) => ({ value: String(n), label: `${n} / page` }))

// ---------- 5. The page ----------
export function Component() {
  const [users, setUsers] = useState(mockUsers)
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [pageDraft, setPageDraft] = useState(null) // what the page box shows while typing

  // Row menu handlers (offline: they only change the local list)
  const onEdit = useCallback((u) => toast(`Edit ${fullName(u)} (not wired yet)`), [])
  const onUpdate = useCallback((u) => {
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, blocked: !x.blocked } : x)))
    toast.success(`${fullName(u)} ${u.blocked ? "unblocked" : "blocked"}`)
  }, [])
  const onDelete = useCallback((ids) => {
    setUsers((list) => list.filter((x) => !ids.includes(x.id)))
    setRowSelection({})
    toast.success(ids.length === 1 ? "User deleted" : `${ids.length} users deleted`)
  }, [])
  const onAdd = useCallback(() => {
    setUsers((list) => {
      const n = list.length
      const added = {
        id: Math.max(0, ...list.map((x) => x.id)) + 1,
        first_name: firstNames[n % firstNames.length],
        last_name: lastNames[(n * 3) % lastNames.length],
        username: `new_user_${n + 1}`,
        is_premium: false,
        blocked: false,
        created_at: Date.now()
      }
      return [added, ...list]
    })
    toast.success("User added")
  }, [])

  const columns = useMemo(() => makeColumns({ onEdit, onDelete, onUpdate }), [onEdit, onDelete, onUpdate])

  const table = useTable({
    features,
    columns,
    data: users,
    getRowId,
    globalFilterFn: "includesString",
    autoResetPageIndex: false, // keep your page after Update / Delete (we reset it ourselves on search)
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

      {/* Selected count (left) + Add / batch Delete (right) */}
      <div className="flex min-h-8 items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">
          {selectedCount} of {table.getFilteredRowModel().rows.length} row(s) selected
        </span>
        {selectedCount > 0 ? (
          <Button variant="destructive" size="sm" onClick={() => onDelete(table.getFilteredSelectedRowModel().rows.map((r) => r.original.id))}>
            <Trash2 /> Delete ({selectedCount})
          </Button>
        ) : (
          <Button size="sm" onClick={onAdd}>
            <Plus /> Add
          </Button>
        )}
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

      {/* Per page + page box (left), arrows (right) */}
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Select items={pageSizes} value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
            <SelectTrigger size="sm" aria-label="Rows per page" className="w-28">
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
          <Input type="number" inputMode="numeric" min={1} max={pageCount} aria-label="Page number" value={pageDraft ?? pageIndex + 1} onChange={(e) => goToPage(e.target.value)} onBlur={() => setPageDraft(null)} className="h-8 w-14 px-2 text-center" />
          <span className="text-muted-foreground">of {pageCount}</span>
        </div>
        <div className="flex items-center gap-2">
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
