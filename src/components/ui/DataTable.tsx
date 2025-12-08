import { useState } from 'react'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, flexRender, SortingState, ColumnDef } from '@tanstack/react-table'
import { Box, Table, TableHead, TableRow, TableCell, TableBody, TablePagination } from '@mui/material'
import { ArrowUpward, ArrowDownward } from '@mui/icons-material'

interface Props<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  pageSize?: number
  maxHeight?: number
}

export default function DataTable<T>({ data, columns, pageSize = 20, maxHeight = 500 }: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } }
  })

  return (
    <Box>
      <Box sx={{ overflow: 'auto', maxHeight }}>
        <Table size="small" stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => (
                  <TableCell
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 600, bgcolor: '#f5f5f5' }}
                  >
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: <ArrowUpward sx={{ fontSize: 16 }} />, desc: <ArrowDownward sx={{ fontSize: 16 }} /> }[header.column.getIsSorted() as string] ?? null}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id} hover>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} sx={{ whiteSpace: 'nowrap' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={data.length}
        page={table.getState().pagination.pageIndex}
        rowsPerPage={table.getState().pagination.pageSize}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />
    </Box>
  )
}
