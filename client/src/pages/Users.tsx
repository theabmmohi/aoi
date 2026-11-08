import { columnFilteringFeature, columnVisibilityFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, filterFn_includesString, globalFilteringFeature, rowPaginationFeature, rowSortingFeature, sortFn_alphanumeric, sortFn_basic, sortFn_text, tableFeatures, useTable, type Column, type ColumnVisibilityState, type SortingState } from "@tanstack/react-table"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpDown, ChevronsUpDown, ExternalLink } from "lucide-react"
import { useUsers, type User } from "@/stores/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

type Features = typeof features

const getRowId = (user: User) => String(user.id)
const titleOf = <V,>(column: Column<Features, User, V>) => (column.columnDef.meta as { title: string }).title
const SortHeader = <V,>({ column }: { column: Column<Features, User, V> }) => (
  <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
    {titleOf(column)}
    <ArrowUpDown />
  </Button>
)

const helper = createColumnHelper<Features, User>()
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
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${username} on Telegram`}
            onClick={(event) => {
              const telegram = window.Telegram?.WebApp
              if (!telegram?.openTelegramLink) return
              event.preventDefault()
              telegram.openTelegramLink(url)
            }}
            className="-m-1 p-1 text-muted-foreground hover:text-foreground"
          >
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
    cell: ({ getValue }) => <span className="font-mono">{new Date(getValue()).toLocaleString([], { dateStyle: "medium", timeStyle: "short", hour12: true })}</span>,
    sortFn: "basic",
    enableGlobalFilter: false
  }),
  helper.accessor((u) => u.is_premium, {
    id: "is_premium",
    meta: { title: "Premium" },
    header: ({ column }) => <SortHeader column={column} />,
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
    sortFn: "basic",
    enableGlobalFilter: false
  })
])
const pageSizes = [10, 25, 50].map((n) => ({
  value: String(n),
  label: (
    <>
      <span className="font-mono">{n}</span> per page
    </>
  )
}))

export function Component() {
  const users = useUsers((s) => s.users) ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({})

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
