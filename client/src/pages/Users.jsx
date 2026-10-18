import { columnFilteringFeature, columnVisibilityFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, filterFn_includesString, globalFilteringFeature, rowPaginationFeature, rowSortingFeature, sortFn_alphanumeric, sortFn_basic, sortFn_text, tableFeatures, useTable } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table"
import { ArrowUpDown, ChevronDown } from "lucide-react"
import { serverlessCall } from "@lib/serverlessCall"
import { useEffect, useState } from "react"
import { Button } from "@ui/button"
import { Input } from "@ui/input"

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic, text: sortFn_text }
})

const noUsers = []
const getRowId = (user) => String(user.id)

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

function ColumnSelect({ table }) {
  const flip = useChevronFlip()
  return (
    <DropdownMenu onOpenChange={flip.onOpenChange}>
      <DropdownMenuTrigger render={<Button variant="outline" className={chevronSpin} style={flip.style} />}>
        Columns <ChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
              {titleOf(column)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function openProfile(event, url) {
  const telegram = window.Telegram?.WebApp
  if (!telegram?.openTelegramLink) return
  event.preventDefault()
  telegram.openTelegramLink(url)
}

const helper = createColumnHelper()

const columns = helper.columns([
  helper.accessor("id", {
    meta: { title: "ID" },
    header: ({ column }) => <SortHeader column={column} />,
    cell: ({ getValue }) => <span className="font-mono">{getValue()}</span>,
    sortFn: "basic",
    enableHiding: false
  }),
  helper.accessor((u) => [u.first_name, u.last_name].filter(Boolean).join(" "), {
    id: "name",
    meta: { title: "Name" },
    header: ({ column }) => <SortHeader column={column} />,
    sortFn: "text"
  }),
  helper.accessor((u) => u.username ?? "", {
    id: "username",
    meta: { title: "Username" },
    header: ({ column }) => <SortHeader column={column} />,
    cell: ({ getValue }) => {
      const url = `https://t.me/${getValue()}`
      return getValue() ? (
        <a href={url} target="_blank" rel="noreferrer" onClick={(event) => openProfile(event, url)} className="underline-offset-4 hover:underline">
          {getValue()}
        </a>
      ) : (
        "-"
      )
    },
    sortFn: "text"
  }),
  helper.accessor("created_at", {
    meta: { title: "Joined" },
    header: ({ column }) => <SortHeader column={column} />,
    cell: ({ getValue }) => new Date(getValue()).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }),
    sortFn: "basic",
    enableGlobalFilter: false
  }),
  helper.accessor("is_premium", {
    meta: { title: "Premium" },
    header: ({ column }) => <SortHeader column={column} />,
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
    sortFn: "basic",
    enableGlobalFilter: false
  })
])

const pageSizes = [10, 20, 50].map((n) => ({
  value: String(n),
  label: (
    <>
      <span className="font-mono">{n}</span> per page
    </>
  )
}))

export function Component() {
  const [users, setUsers] = useState(null) // null = still loading
  const [error, setError] = useState(null)
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState({})
  const pageFlip = useChevronFlip()

  useEffect(() => {
    serverlessCall("users")
      .then(setUsers)
      .catch((e) => setError(e.message ?? "Something went wrong"))
  }, [])

  const table = useTable({
    features,
    columns,
    data: users ?? noUsers,
    getRowId,
    globalFilterFn: "includesString",
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, globalFilter, columnVisibility }
  })

  if (error) return <p className="p-4 text-destructive">{error}</p>
  if (!users) return <p className="p-4 text-muted-foreground">Loading...</p>

  const { pageIndex, pageSize } = table.state.pagination

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input placeholder="Search name, username, ID..." value={globalFilter} onChange={(e) => table.setGlobalFilter(e.target.value)} className="min-w-0 flex-1" />
        <ColumnSelect table={table} />
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
    </div>
  )
}
