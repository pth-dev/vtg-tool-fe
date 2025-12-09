import { Paper, Typography } from '@mui/material'

interface TableEmptyStateProps {
  message?: string
}

/**
 * Empty state display for tables
 */
export function TableEmptyState({ message = 'No data available' }: TableEmptyStateProps) {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="text.secondary">{message}</Typography>
    </Paper>
  )
}

