import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table"
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table"
import { serverlessCall } from "@lib/serverlessCall"
import { useEffect, useState } from "react"

const features = tableFeatures({})
const helper = createColumnHelper()

const columns = helper.columns([
  helper.accessor((u) => [u.first_name, u.last_name].filter(Boolean).join(" "), {
    id: "name",
    header: "Name"
  }),
  helper.accessor("username", {
    header: "Username",
    cell: ({ getValue }) => (getValue() ? getValue() : "-")
  }),
  helper.accessor("id", { header: "ID" }),
  helper.accessor("is_premium", {
    header: "Premium",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No")
  }),
  helper.accessor("blocked", {
    header: "Blocked",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No")
  }),
  helper.accessor("created_at", {
    header: "Joined",
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString()
  })
])

const noUsers = []

export function Component() {
  const [users, setUsers] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    serverlessCall("users")
      .then(setUsers)
      .catch((e) => setError(e.message ?? "Something went wrong"))
  }, [])

  const table = useTable({ features, columns, data: users ?? noUsers })

  if (error) return <p className="p-4 text-destructive">{error}</p>
  if (!users) return <p className="p-4 text-muted-foreground">Loading...</p>

  return (
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
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
              No users yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
