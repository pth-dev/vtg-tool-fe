import { Delete, Storage, Visibility } from '@mui/icons-material'
import {
  Box,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'

import { PAGINATION } from '@/constants'
import { EmptyState } from '@/shared/components/ui'
import type { Dataset } from '@/types'

interface DatasetTableProps {
  datasets: Dataset[]
  totalCount: number
  page: number
  rowsPerPage: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
  onPreview: (dataset: Dataset) => void
  onDelete: (dataset: Dataset) => void
  onImport: () => void
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DatasetTable({
  datasets,
  totalCount,
  page,
  rowsPerPage,
  isLoading,
  onPageChange,
  onRowsPerPageChange,
  onPreview,
  onDelete,
  onImport,
}: DatasetTableProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
          Loading...
        </TableCell>
      </TableRow>
    )
  }

  if (datasets.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5}>
          <EmptyState
            icon={<Storage sx={{ fontSize: 48 }} />}
            title="No datasets yet"
            description="Import your first dataset to get started"
            action={{ label: 'Import Data', onClick: onImport, icon: <Storage /> }}
          />
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: isDark ? '#1a1a1a' : 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Dataset Name</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Rows
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Columns
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Created</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {datasets.map((d) => (
            <TableRow key={d.id} hover>
              <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                  <Storage color="primary" fontSize="small" />
                  <Typography fontWeight={500}>{d.name}</Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={d.row_count?.toLocaleString() || '0'}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">{d.columns?.length || 0}</TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(d.created_at)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <IconButton size="small" onClick={() => onPreview(d)} title="Preview">
                  <Visibility />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => onDelete(d)} title="Delete">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {datasets.length > 0 && (
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, p) => onPageChange(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value))}
          rowsPerPageOptions={PAGINATION.PAGE_SIZE_OPTIONS as unknown as number[]}
        />
      )}
    </>
  )
}
