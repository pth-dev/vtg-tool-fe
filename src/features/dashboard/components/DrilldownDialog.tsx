import { Close } from '@mui/icons-material'
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, useTheme } from '@mui/material'

import { DataPreviewTable } from '@/shared/components/ui'

interface DrilldownDialogProps {
  open: boolean
  dimension: string
  value: string
  data: Record<string, unknown>[]
  columns: string[]
  total: number
  page: number
  rowsPerPage: number
  isLoading: boolean
  onClose: () => void
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
}

/**
 * Dialog for drilldown data display
 */
export function DrilldownDialog({
  open,
  dimension,
  value,
  data,
  columns,
  total,
  page,
  rowsPerPage,
  isLoading,
  onClose,
  onPageChange,
  onRowsPerPageChange,
}: DrilldownDialogProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const dimensionLabel = dimension === 'customer' ? 'Customer' : 'Category'

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDark ? '#0a0a0a' : 'background.paper',
          maxHeight: '85vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">Orders for: {value}</Typography>
          <Typography variant="caption" color="text.secondary">
            {dimensionLabel} • {total} total orders
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <DataPreviewTable
          data={data}
          columns={columns.map((name) => ({ name }))}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          isLoading={isLoading}
          showPagination
          maxHeight={500}
          rowsPerPageOptions={[10, 20, 50, 100]}
          onPageChange={onPageChange}
          onRowsPerPageChange={(rows) => {
            onRowsPerPageChange(rows)
          }}
          emptyMessage="No orders found"
        />
      </DialogContent>
    </Dialog>
  )
}

