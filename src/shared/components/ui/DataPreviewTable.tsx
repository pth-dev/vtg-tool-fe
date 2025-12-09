import { Paper, Table, TableBody, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material'

import {
  ColumnSchema,
  TableDataRow,
  TableEmptyState,
  TableHeaderCell,
  TableSearchHeader,
  TableSkeleton,
} from '@/shared/components/table'

export type { ColumnSchema } from '@/shared/components/table'

export interface DataPreviewTableProps {
  /** Array of data rows */
  data: Record<string, unknown>[]
  /** Column definitions (optional - will infer from data if not provided) */
  columns?: ColumnSchema[]
  /** Total count for pagination */
  total?: number
  /** Current page (0-indexed) */
  page?: number
  /** Rows per page */
  rowsPerPage?: number
  /** Loading state */
  isLoading?: boolean
  /** Show search input */
  showSearch?: boolean
  /** Search value (controlled) */
  searchValue?: string
  /** Show column type badges */
  showColumnTypes?: boolean
  /** Show pagination */
  showPagination?: boolean
  /** Max height of table */
  maxHeight?: number
  /** Row size options for pagination */
  rowsPerPageOptions?: number[]
  /** Callbacks */
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
  onSearchChange?: (search: string) => void
  /** Empty state message */
  emptyMessage?: string
  /** Header info (e.g., "86 total orders") */
  headerInfo?: string
}

/**
 * Reusable Data Preview Table Component
 *
 * Composed of atomic table components for maximum reusability.
 */
export function DataPreviewTable({
  data,
  columns,
  total,
  page = 0,
  rowsPerPage = 20,
  isLoading = false,
  showSearch = false,
  searchValue = '',
  showColumnTypes = false,
  showPagination = true,
  maxHeight = 500,
  rowsPerPageOptions = [10, 20, 50, 100],
  onPageChange,
  onRowsPerPageChange,
  onSearchChange,
  emptyMessage = 'No data available',
  headerInfo,
}: DataPreviewTableProps) {
  // Infer column names from data if not provided
  const columnNames = columns?.map((c) => c.name) || (data.length > 0 ? Object.keys(data[0]) : [])
  const totalCount = total ?? data.length

  // Loading state
  if (isLoading) {
    return <TableSkeleton rows={5} />
  }

  // Empty state
  if (data.length === 0) {
    return <TableEmptyState message={emptyMessage} />
  }

  return (
    <>
      <TableSearchHeader
        info={headerInfo || `${totalCount.toLocaleString()} rows • ${columnNames.length} columns`}
        showSearch={showSearch}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />

      <TableContainer
        component={Paper}
        sx={{
          maxHeight,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', minWidth: columnNames.length * 140 }}>
          <TableHead>
            <TableRow>
              {columnNames.map((colName, i) => {
                const schema = columns?.find((c) => c.name === colName)
                return (
                  <TableHeaderCell
                    key={i}
                    column={schema || colName}
                    showType={showColumnTypes}
                  />
                )
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, i) => (
              <TableDataRow key={i} row={row} columns={columnNames} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && onPageChange && onRowsPerPageChange && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value))}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      )}
    </>
  )
}
