import { columnFilteringFeature, columnVisibilityFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, filterFn_includesString, globalFilteringFeature, rowPaginationFeature, rowSortingFeature, sortFn_alphanumeric, sortFn_basic, sortFn_text, tableFeatures, useTable } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table"
import { ArrowUpDown, ChevronsUpDown, ExternalLink } from "lucide-react"
import { serverlessCall } from "@lib/serverlessCall"
import { useRouteLoaderData } from "react-router"
import { Button } from "@ui/button"
import { Input } from "@ui/input"
import { useState } from "react"

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

function ColumnSelect({ table }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Columns <ChevronsUpDown />
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

function Joined({ value }) {
  const { settings } = useRouteLoaderData("app")
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short", hour12: true, timeZone: settings.timezone })
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
      const username = getValue()
      if (!username) return "-"
      const url = `https://t.me/${username}`
      return (
        <span className="inline-flex items-center gap-1.5">
          <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${username} on Telegram`} onClick={(event) => openProfile(event, url)} className="-m-1 p-1 text-muted-foreground hover:text-foreground">
            <ExternalLink className="size-3.5" />
          </a>
          {username}
        </span>
      )
    },
    sortFn: "text"
  }),
  helper.accessor("created_at", {
    meta: { title: "Joined" },
    header: ({ column }) => <SortHeader column={column} />,
    cell: ({ getValue }) => <span className="font-mono"><Joined value={getValue()} /></span>,
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
  const { users } = useRouteLoaderData("app")
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState({})

  const table = useTable({
    features,
    columns,
    data: users,
    getRowId,
    globalFilterFn: "includesString",
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, globalFilter, columnVisibility }
  })

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
          <Select items={pageSizes} value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
            <SelectTrigger size="sm" aria-label="Rows per page" icon={<ChevronsUpDown className="pointer-events-none size-4 text-muted-foreground" />}>
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
